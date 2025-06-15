import { ClientFormData } from "../types";

export function validateClient(values: ClientFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.name || values.name.trim() === "") {
    errors.name = "Client name is required";
  }
  if (values.panVat && isNaN(Number(values.panVat))) {
    errors.panVat = "PAN/VAT must be a number";
  }
  if (values.openingBalance && isNaN(Number(values.openingBalance))) {
    errors.openingBalance = "Opening balance must be a number";
  }
  return errors;
}
