const yup = require('yup');
//validation for the data 
const projectSchema = yup.object().shape({
  name: yup.string().required('Project name is required'),
  summary: yup.string().min(20).max(80).required('Project Summary is required. the summary has to be mor than 20 char and less than 80 char'),
  manager: yup.object().shape({
    name: yup.string().required('Manager name is required'),
    email: yup.string().email('Invalid email format').required('Manager email is required'),
  }),
  team: yup.array().of(
    yup.object().shape({
      name: yup.string().required('Team member name is required'),
      email: yup.string().required('Team member email is required'),
      role: yup.string().required('Team member role is required'),
    })
  ),
  start_date: yup.date().required('Start date is required'),
});

const validateProject = (project) => {
  return projectSchema.validate(project, { abortEarly: false });
};

module.exports = validateProject;
