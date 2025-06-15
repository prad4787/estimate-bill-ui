/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useFormContext } from "./Form";

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  as?: "input" | "textarea";
  [key: string]: any;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = "text",
  as = "input",
  ...rest
}) => {
  const { values, errors, touched, handleChange, handleBlur } =
    useFormContext<any>();
  const showError = errors[name] && touched[name];
  const InputComponent = as === "textarea" ? "textarea" : "input";

  return (
    <div className="mb-6">
      <label htmlFor={name} className="form-label">
        {label}
      </label>
      <InputComponent
        id={name}
        name={name}
        type={type}
        value={values[name] || ""}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`form-input${showError ? " error" : ""}`}
        {...rest}
      />
      {showError && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          {errors[name]}
        </p>
      )}
    </div>
  );
};

export default FormField;
