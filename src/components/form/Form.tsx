/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useState,
  createContext,
  useContext,
  ReactNode,
  FormEvent,
} from "react";

interface FormContextProps<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any>) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FormContext = createContext<FormContextProps<any> | undefined>(undefined);

export function useFormContext<T>() {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error("useFormContext must be used within a <Form>");
  return ctx as FormContextProps<T>;
}

interface FormProps<T> {
  initialValues: T;
  validate?: (values: T) => Record<string, string>;
  onSubmit: (values: T) => void | Promise<void>;
  children:
    | ReactNode
    | ((
        ctx: FormContextProps<T> & {
          handleSubmit: (e: FormEvent) => void;
          isSubmitting: boolean;
        }
      ) => ReactNode);
}

export function Form<T>({
  initialValues,
  validate,
  onSubmit,
  children,
}: FormProps<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: React.FocusEvent<any>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate ? validate(values) : {};
    setErrors(validationErrors);
    setTouched(
      Object.keys(values as Record<string, unknown>).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      )
    );
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      await onSubmit(values);
      setIsSubmitting(false);
    }
  };

  const ctxValue: FormContextProps<T> = {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
  };

  return (
    <FormContext.Provider value={ctxValue}>
      <form onSubmit={handleSubmit}>
        {typeof children === "function"
          ? children({ ...ctxValue, handleSubmit, isSubmitting })
          : children}
      </form>
    </FormContext.Provider>
  );
}
