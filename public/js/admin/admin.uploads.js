const user_id = JSON.parse(window.sessionStorage.getItem("session-admin"));
const acceptPdfOnly = ".pdf";
const acceptWordDocumentsOnly = ".doc, .docx";
const acceptImages = ".jpg, .jpeg, .png";

const getFormAction = (category = "images", visibility = "public", id) => {
    return `/admin/store/uploads/${visibility.trim().toLowerCase()}/${category.trim().toLowerCase()}/${id}`;
}

const matchCategoryToValidFileTypes = (category = " image") => {
    let trimmedCategory = category.trim().toLowerCase();
    let validFileTypes = {
        "image": acceptImages,
        "pdf": acceptPdfOnly,
        "doc": acceptWordDocumentsOnly
    }

    let validFileType = validFileTypes[trimmedCategory];

    return validFileType || null;
}

const uploadMain = () => {
    let fileCategory = getId("fileCategory");
    fileCategory.addEventListener("change", (e) => {
        const category = e.target.value;
        const acceptedFileTypes = matchCategoryToValidFileTypes(category);

        getId("fileUpload").setAttribute("accept", acceptedFileTypes);
    });
    const uploadForm = getId("uploadForm");

    uploadForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const visibility = getId("visibility").value;
        const category = getId("fileCategory").value;

        if (!user_id) return;

        const formAction = getFormAction(category, visibility, user_id);

        uploadForm.setAttribute("action", encodeURI(formAction));

        uploadForm.submit();
    })


}

document.addEventListener("DOMContentLoaded", uploadMain);

