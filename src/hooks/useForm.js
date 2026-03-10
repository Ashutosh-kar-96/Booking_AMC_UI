// hooks/useForm.js
const useForm = (initialValues) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
  };

  const setField = (name, value) => {
    setValues({ ...values, [name]: value });
  };

  return {
    values,
    errors,
    setErrors,
    handleChange,
    resetForm,
    setField
  };
};