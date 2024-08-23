const yup = require('yup');
// the validation for the edited data
const editedProjectSchema = yup.object().shape({
    name: yup.string(),
    summary: yup.string()
    .min(20, 'The summary has to be more than 20 characters')
    .max(80, 'The summary has to be less than 80 characters'),
    start_date: yup.string(),
});

const validateEditedProject = (project) => {
    return editedProjectSchema.validate(project, { abortEarly: false });
};

module.exports = validateEditedProject;