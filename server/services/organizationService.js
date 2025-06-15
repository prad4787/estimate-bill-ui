const { OrganizationModel, OrganizationContactModel } = require("../models");
const path = require("path");
const fs = require("fs").promises;

const UPLOAD_DIR = path.join(__dirname, "../uploads/logos");

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

exports.getOrganization = async () => {
  const organization = await OrganizationModel.findOne({
    include: [
      {
        model: OrganizationContactModel,
        as: "contacts",
      },
    ],
  });

  if (!organization) return null;

  // Transform contacts into phones and emails arrays
  const phones = organization.contacts
    .filter((c) => c.type === "phone")
    .map((c) => c.value);

  const emails = organization.contacts
    .filter((c) => c.type === "email")
    .map((c) => c.value);

  return {
    ...organization.toJSON(),
    phones,
    emails,
    contacts: undefined, // Remove the contacts array
  };
};

exports.updateOrganization = async (data) => {
  const organization = await OrganizationModel.findOne();
  if (!organization) return null;

  // Update organization details
  const { phones, emails, ...orgData } = data;
  await organization.update(orgData);

  // Update contacts if provided
  if (phones || emails) {
    // Delete existing contacts
    await OrganizationContactModel.destroy({
      where: { organizationId: organization.id },
    });

    // Create new contacts
    const contacts = [
      ...(phones || []).map((phone) => ({
        organizationId: organization.id,
        type: "phone",
        value: phone,
        isPrimary: false,
      })),
      ...(emails || []).map((email) => ({
        organizationId: organization.id,
        type: "email",
        value: email,
        isPrimary: false,
      })),
    ];

    if (contacts.length > 0) {
      // Set first contact of each type as primary
      const phoneIndex = contacts.findIndex((c) => c.type === "phone");
      const emailIndex = contacts.findIndex((c) => c.type === "email");

      if (phoneIndex !== -1) contacts[phoneIndex].isPrimary = true;
      if (emailIndex !== -1) contacts[emailIndex].isPrimary = true;

      await OrganizationContactModel.bulkCreate(contacts);
    }
  }

  return this.getOrganization();
};

exports.uploadLogo = async (file) => {
  await ensureUploadDir();

  const organization = await OrganizationModel.findOne();
  if (!organization) return null;

  // Delete old logo if exists
  if (organization.logoUrl) {
    const oldLogoPath = path.join(
      UPLOAD_DIR,
      path.basename(organization.logoUrl)
    );
    try {
      await fs.unlink(oldLogoPath);
    } catch (error) {
      console.error("Failed to delete old logo:", error);
    }
  }

  // Generate unique filename
  const ext = path.extname(file.originalname);
  const filename = `logo_${Date.now()}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  // Save file
  await fs.writeFile(filepath, file.buffer);

  // Update organization with new logo URL
  const logoUrl = `/uploads/logos/${filename}`;
  await organization.update({ logoUrl });

  return logoUrl;
};

exports.deleteLogo = async () => {
  const organization = await OrganizationModel.findOne();
  if (!organization || !organization.logoUrl) return false;

  const logoPath = path.join(UPLOAD_DIR, path.basename(organization.logoUrl));
  try {
    await fs.unlink(logoPath);
  } catch (error) {
    console.error("Failed to delete logo file:", error);
  }

  await organization.update({ logoUrl: null });
  return true;
};
