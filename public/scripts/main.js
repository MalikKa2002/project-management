edited_data = {};
edited_data_id = "";
selected_data_id = "";
view_data_id = "";
vproject_data_id="";
imgId ="";
photos = [];

$(document).ready(function() {
    loadProjects();
//sortig by things 
    $('#sortByName').click(function() {
        sortAndRenderProjects('name');
    });

    $('#sortByManager').click(function() {
        sortAndRenderProjects('manager');
    });

    $('#sortByDate').click(function() {
        sortAndRenderProjects('start_date');
    });

    function sortAndRenderProjects(criterion) {
        projects.sort((a, b) => {
            if (criterion === 'name') {
                return a.name.localeCompare(b.name);
            } else if (criterion === 'manager') {
                return a.manager.name.localeCompare(b.manager.name);
            } else if (criterion === 'start_date') {
                return new Date(b.start_date) - new Date(a.start_date); // Sort by date descending
            }
        });
        renderProjects(projects);
    }
//to get the projects sorting by date
    function loadProjects() {
        $.ajax({
            url: '/projects',
            method: 'GET',
            success: function(data) {
                projects = data;
                sortAndRenderProjects('start_date');
            }
        });
    }
    //this build the list of projects
    function renderProjects(projects) {
        const projectList = $('#projectList');
        projectList.empty();
        projects.forEach(project => {
            const projectItem = `
                <div class="project-item" data-id="${project.id}">
                    <h3>${project.name}</h3>
                    <p>${project.summary}</p>
                    <p><strong>Manager:</strong> ${project.manager.name} (${project.manager.email})</p>
                     <p><strong>Start Date:</strong> ${new Date(project.start_date).toLocaleDateString()}</p>
                    <p><strong>Team:</strong> ${project.team.map(member => `${member.name} (${member.email}) - ${member.role}`).join(', ')}</p>
                    <button class="edit-project">Edit</button>
                    <button class="delete-project">Delete</button>
                    <button class="add-image">Add Image</button>
                    <button class="view-images">View Images</button>
                    <button class="add-member">Add Member</button>
                </div>
            `;
            projectList.append(projectItem);
        });
    }
//this give us the project by id
    function getProjectById(projectId) {
        $.ajax({
            url: `/projects/${projectId}`,
            method: 'GET',
            success: function(project) {
                renderProjectByID(project);
            },
            error: function(err) {
                console.error('Error fetching project:', err);
            }
        });
    }
//this like the reguler render just for the edited projects
    function renderProjectByID(project) {
        const editmodel = $('.members');
        const editmodelName = $('#editedProjectName'); 
        const editmodelSummary = $('#editedProjectSummary');
        const editmodelDate = $('#editedStartDate');
        const editItem = `
                    <p><strong>Manager:</strong> ${project.manager.name} (${project.manager.email})</p>
                    <p><strong>Team:</strong> ${project.team.map(member => `${member.name} (${member.email}) - ${member.role}`).join(', ')}</p>
        `;
        editmodelName.val(project.name);
        editmodelSummary.val(project.summary);
        editmodelDate.val(project.start_date);
        edited_data_id = project.id;
        edited_data = {name: project.name, summary: project.summary, start_date:project.start_date};
        editmodel.append(editItem);
        const popUpElements = document.getElementsByClassName('editmodal');
        if (popUpElements.length > 0) {
            popUpElements[0].style.display = 'block';
        } else {
            console.error('Pop-up element not found');
        }
    }
//this for the image by id 
    function getProjectByIdforImage(projectId, imageId, image) {
        $.ajax({
            url: `/projects/${projectId}`,
            method: 'GET',
            success: function(project) {
                imagesById(project, imageId, image);
            },
            error: function(err) {
                console.error('Error fetching project:', err);
            }
        });
    }
//this function check if already exist the image or not 
    function imagesById(project, imageId, image){
        x = project.images;
        exist = false;
        x.forEach(photo => {
            if(photo.id === imageId){
              
                alert('image already exist in your project');
                exist = true;
                modal.hide();
                pop_up.show();
                let element = document.getElementById('addtoproject');
                element.className = "";
               
            }
        });
        if(!exist){
            modal.hide();
            pop_up.show();
            viewmodal.attr('src', image.urls.thumb);
            if(image.description === null)
                addImageToProject(selected_data_id,{thumb:image.urls.thumb, id:image.id, description:'No description'});
            else
                addImageToProject(selected_data_id,{thumb:image.urls.thumb, id:image.id, description:image.description});
                            
            let element = document.getElementById('addtoproject');
            element.className = "";
        }
    }
//creat project 
    function createProject(project) {
        $.ajax({
            url: '/projects',
            method: 'POST',
            data: JSON.stringify(project),
            contentType: 'application/json',
            success: function(newProject) {
                loadProjects();
            }
        });
    }
//update project
    function updateProject(projectId, updates) {
        $.ajax({
            url: `/projects/${projectId}`,
            method: 'PUT',
            data: JSON.stringify(updates),
            contentType: 'application/json',
            success: function(updatedProject) {
                loadProjects();
            }
        });
    }
//delete project
    function deleteProject(projectId) {
        $.ajax({
            url: `/projects/${projectId}`,
            method: 'DELETE',
            success: function() {
                loadProjects();
            }
        });
    }

 
//to add image to the project
    function addImageToProject(projectId, keyword) {
        $.ajax({
            url: `/projects/${projectId}/images`,
            method: 'POST',
            data: JSON.stringify(keyword),
            contentType: 'application/json',
            success: function(image) {
                loadProjects();
            }
        });
    }
//to add member to the team of the project
    function addMemberToProject(projectId, member) {
        $.ajax({
            url: `/projects/${projectId}/team`,
            method: 'POST',
            data: JSON.stringify(member),
            contentType: 'application/json',
            success: function(updatedProject) {
                loadProjects();
            }
            
        });
        
    }
//handeling the buttons with validation client side
    $('#createProjectForm').on('submit', function(event) {
        event.preventDefault();

        let isValid = true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Validate project name
        const projectName = $('#projectName').val();
        if (!projectName) {
            alert('Project Name is required.');
            isValid = false;
        }

        // Validate project summary
        const projectSummary = $('#projectSummary').val();
        if (!projectSummary||projectSummary.length<20||projectSummary.length>80) {
            alert('Project Summary is required. the summary has to be more than 20 char and less than 80 char');//server side to change the condetions 
            isValid = false;
        }

        // Validate manager name
        const managerName = $('#managerName').val();
        if (!managerName) {
            alert('Manager Name is required.');
            isValid = false;
        }

        // Validate manager email
        const managerEmail = $('#managerEmail').val();
        if (!managerEmail) {
            alert('Manager Email is required.');
            isValid = false;
        } else {
            // Simple email regex for validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(managerEmail)) {
                alert('Invalid Manager Email format.');
                isValid = false;
            }
        }

        // Validate start date
        const startDate = $('#startDate').val();
        if (!startDate) {
            alert('Start Date is required.');
            isValid = false;
        }       
        
        $('.requierdteamMember').each(function() {
            const RmemberName = $(this).find('.teamMemberName').val();
            const RmemberEmail = $(this).find('.teamMemberEmail').val();
            const RmemberRole = $(this).find('.teamMemberRole').val();

            if (!RmemberName) {
                alert('Team Member Name is required.');
                isValid = false;
            }

            if (!RmemberEmail) {
                alert('Team Member Email is required.');
                isValid = false;
            } else {
                // Simple email regex for validation
                if (!emailRegex.test(RmemberEmail)) {
                    alert('Invalid Team Member Email format.');
                    isValid = false;
                }
            }

            if (!RmemberRole) {
                alert('Team Member Role is required.');
                isValid = false;
            }
        });
       
         // Validate team members
        $('.teamMember').each(function() {
            const memberName = $(this).find('.teamMemberName').val();
            const memberEmail = $(this).find('.teamMemberEmail').val();
            const memberRole = $(this).find('.teamMemberRole').val();

            if (!memberName) {
                alert('Team Member Name is required.');
                isValid = false;
            }

            if (!memberEmail) {
                alert('Team Member Email is required.');
                isValid = false;
            } else {
                // Simple email regex for validation
                if (!emailRegex.test(memberEmail)) {
                    alert('Invalid Team Member Email format.');
                    isValid = false;
                }
            }

            if (!memberRole) {
                alert('Team Member Role is required.');
                isValid = false;
            }
        });

        // Proceed with form submission

        const project = {
            name: projectName,
            summary: projectSummary,
            manager: {
                name: managerName,
                email: managerEmail,
            },
            start_date: startDate,
            team: []
        };

        $('.requierdteamMember').each(function() {
            const Rmember = {
                name: $(this).find('.teamMemberName').val(),
                email: $(this).find('.teamMemberEmail').val(),
                role: $(this).find('.teamMemberRole').val()
            };
            project.team.push(Rmember);
        });

        $('.teamMember').each(function() {
            const member = {
                name: $(this).find('.teamMemberName').val(),
                email: $(this).find('.teamMemberEmail').val(),
                role: $(this).find('.teamMemberRole').val()
            };
            project.team.push(member);
        });

        createProject(project);
        const elements = document.querySelectorAll('.teamMember');
        elements.forEach(element => element.remove());
        $('#createProjectForm')[0].reset();
    });

    $('#addTeamMember').on('click', function() {
        const newMemberForm = `
            <div class="teamMember">
                <label for="teamMemberName">Name:</label>
                <input type="text" class="teamMemberName" name="teamMemberName[]">
                <label for="teamMemberEmail">Email:</label>
                <input type="email" class="teamMemberEmail" name="teamMemberEmail[]">
                <label for="teamMemberRole">Role:</label>
                <input type="text" class="teamMemberRole" name="teamMemberRole[]">
                <button type="button" class="removeTeamMember">Remove member</button>
            </div>
        `;
        $('#teamMembers').append(newMemberForm);
        
    });

    $('#teamMembers').on('click', '.removeTeamMember', function() {
        $(this).closest('.teamMember').remove();
    });
    
  


    $('#projectList').on('click', '.edit-project', function() {
        const projectId = $(this).closest('.project-item').data('id');
        getProjectById(projectId);
    });

    $('#projectList').on('click', '.delete-project', function() {
        const projectId = $(this).closest('.project-item').data('id');
        if (confirm('Are you sure you want to delete this project?')) {
            deleteProject(projectId);
        }
    });

    $('#projectList').on('click', '.add-image', function() {
        const projectId = $(this).closest('.project-item').data('id');
        selected_data_id = projectId;
        const popUpElements = document.getElementsByClassName('pop_up');
        if (popUpElements.length > 0) {
            popUpElements[0].style.display = 'block';
        } else {
            console.error('Pop-up element not found');
        }
    });

    $('#projectList').on('click', '.add-member', function() {
        const projectId = $(this).closest('.project-item').data('id');
        const memberName = prompt('Enter team member name:');
        const memberEmail = prompt('Enter team member Email:');
        const memberRole = prompt('Enter team member role:');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let isValid = true;

        if (!memberName) {
            alert('Team Member Name is required.');
            isValid = false;
        }

        if (!memberEmail) {
            alert('Team Member Email is required.');
            isValid = false;
        } else {
            // Simple email regex for validation
            if (!emailRegex.test(memberEmail)) {
                alert('Invalid Team Member Email format.');
                isValid = false;
            }
        }

        if (!memberRole) {
            alert('Team Member Role is required.');
            isValid = false;
        }

        if (memberName && memberRole &&memberEmail&&isValid) {
            addMemberToProject(projectId, { name: memberName, email: memberEmail ,role: memberRole });
        }
    });
        // Function to display images in a modal
        function displayViewImages(images,projectId) {
            const imagesContainer = $('#galleryOfTheProject');
            imagesContainer.empty();
           
           
            images.forEach(image => {
                const imgElement = `<div class="image-item" data-id="${image.id}">
                <img src="${image.thumb}" alt="${image.description}" style="width: 100px; height: 100px; margin: 5px;">
                <label for='description'>${image.description}</label>
                <div id='deleteimgdiv'>
                <button class="delete-image">delete</button>
                </div>
                </div>
              
                `;
                imagesContainer.append(imgElement);
        
            });

                // Attach event handler for delete buttons
                $('.delete-image').click(function() {
                    const imageId = $(this).closest('.image-item').data('id');
                    deleteImageFromProject(projectId, imageId);
                });
                
         
        }

        // Function to delete image
function deleteImageFromProject(projectId, imageId) {
    $.ajax({
        url: `/projects/${projectId}/images/${imageId}`,
        method: 'DELETE',
        success: function(response) {
            alert(response.message);
            $.ajax({
                url: `/projects/${view_data_id}/images`,
                method: 'GET',
                success: function(images) {
                    displayViewImages(images,view_data_id);
                },
                error: function() {
                    alert('Failed to load images.');
                }
            });

        },
        error: function() {
            alert('Failed to delete image.');
        }
    });
}

    

    $('#projectList').on('click', '.view-images', function() {
        view_data_id = $(this).closest('.project-item').data('id');
       
        
        const popUpElements = document.getElementsByClassName('viewmodal');
            if (popUpElements.length > 0 ) {
                popUpElements[0].style.display = 'block';
            } else {
                console.error('Pop-up element not found');
            }
        
           
 
        $.ajax({
            url: `/projects/${view_data_id}/images`,
            method: 'GET',
            success: function(images) {
                if(images.length==0){
                    popUpElements[0].style.display='none';
                    alert("there is no images in this project");
                }
                    displayViewImages(images,view_data_id);
            },
            error: function() {
                alert('Failed to load images.');
            }
        });
    });
    
//our models for pop up screens
    let currentPage = 0;
    const clientId = 'bWpRp26lh5y82bXfy5qGk4PrGlErDGFHkz_GUCfAxjI'; // My Unsplash client ID
    const searchField = $('#searchField');
    const gallery = $('#gallery');
    const galleryOfTheProject = $('.galleryOfTheProject');
    const loadMoreButton = $('#loadMore');
    const modal = $('#imageModal');
    const modalImage = $('#modalImage');
    const modalTitle = $('#modalTitle');
    const modalDescription = $('#modalDescription');
    const modalLikes = $('#modalLikes');
    const closeModal = $('.close');
    const close_pop_up = $('.close_pop_up');
    const closeeditModel = $('.closeeditmodal');
    const editmodel= $('.editmodal');
    const pop_up = $('.pop_up');
    const submit_edit = $('#submit_edit');
    const membersModel = $('.members');
    const closedView = $('.viewclose');
    const viewmodal = $('.viewmodal');
    const viewgallary = $('.gallery');
    
    const add_to_project = $('#addtoproject');

 

    
    submit_edit.on('click', function(){
        const projectId = edited_data_id;
        let isValid = true;
        const editmodelName = $('#editedProjectName'); 
        const editmodelSummary = $('#editedProjectSummary');
        const editmodelDate = $('#editedStartDate');
        edited_data = {name:editmodelName.val(), summary:editmodelSummary.val(), start_date:editmodelDate.val()};
        // Validate project name
        if (!edited_data.name) {
            alert('Project Name is required.');
            isValid = false;
        }

        // Validate project summary
        const projectSummary = edited_data.summary;
        if (!projectSummary||projectSummary.length<20||projectSummary.length>80) {
            alert('Project Summary is required. the summary has to be more than 20 char and less than 80 char');
            isValid = false;
        }
        membersModel.empty();
        editmodel.hide();
        console.log("upd");
        console.log(projectId);
        updateProject(projectId, edited_data);
    });

    closeeditModel.on('click', function(){
        membersModel.empty();
        editmodel.hide();    
    });

    closedView.on('click', function(){
        viewgallary.empty();
        viewmodal.hide();    
    });
    

    close_pop_up.on('click', function() {
        pop_up.hide();
        const textInput = document.getElementById('searchField');
        if (textInput) {
            textInput.value = '';
            gallery.empty();
            loadMoreButton.hide();    
        } else {
            console.error('Text input element not found');
        }
    });

    searchField.on('input', function() {
        const query = searchField.val().trim();
        photos = [];
        if (query.length >= 3) {
            currentPage = 1;
            searchImages(query);
        } else {
            gallery.empty();
            loadMoreButton.hide();
        }
    });

    loadMoreButton.on('click', function() {
        const query = searchField.val().trim();
        if (query.length >= 3) {
            currentPage++;
            searchImages(query, true);
        }
    });

    closeModal.on('click', function() {
        modal.hide();
        pop_up.show();
    });

    $(window).on('click', function(event) {
        if (event.target == modal[0]) {
            modal.hide();
        }
    });

    function searchImages(query, append = false) {
        $.ajax({
            url: `https://api.unsplash.com/search/photos`,
            data: {
                query: query,
                client_id: clientId,
                per_page: 20,
                page: currentPage
            },
            success: function(data) {
          
                displayImages(data.results, append);
                loadMoreButton.toggle(data.total_pages > currentPage);
            },
            error: function(error) {
                console.error('Error fetching images:', error);
            }
        });
    }
//displaying the images for the client
    function displayImages(images, append) {
        if (!append) gallery.empty();
        let combinedImages = photos.concat(images);
        photos = combinedImages;
     
        images.forEach(image => {
            const imageElement = $(`
                <div class="image">
                    <img src="${image.urls.thumb}" alt="${image.alt_description}">
                </div>
            `);
            imageElement.on('click', function() {
                modalImage.attr('src', image.urls.small);
                modalTitle.text(image.description || 'No title');
                modalDescription.text(image.alt_description || 'No description');
                modalLikes.text(`Likes: ${image.likes}`);
                pop_up.hide();
                modal.show();
                let element = document.getElementById('addtoproject');
                element.className = image.id;
                

                add_to_project.on('click', function(){
                    let element = document.getElementById('addtoproject');
                   
                    photos.forEach(image => {
                        if(image.id === element.className){
                            getProjectByIdforImage(selected_data_id, element.className, image);
                            element.className = "";
                        };
                    });
                    
    
                });
            });
            gallery.append(imageElement);
        });
    }

});
