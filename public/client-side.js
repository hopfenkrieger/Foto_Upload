document.addEventListener("DOMContentLoaded", function () {
    const api_key = "473714754987633";
    const cloud_name = "di58l1urx";
  
    document.querySelector("#upload-form").addEventListener("submit", async function (e) {
      e.preventDefault();
  
      const signatureResponse = await axios.get("/get-signature");
  
      const data = new FormData();
      data.append("file", document.querySelector("#file-field").files[0]);
      data.append("api_key", api_key);
      data.append("signature", signatureResponse.data.signature);
      data.append("timestamp", signatureResponse.data.timestamp);
  
      const cloudinaryResponse = await axios.post(`https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`, data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: function (e) {
          console.log(e.loaded / e.total);
        },
      });
  
      const photoData = {
        public_id: cloudinaryResponse.data.public_id,
        version: cloudinaryResponse.data.version,
        signature: cloudinaryResponse.data.signature,
      };
  
      axios.post("/do-something-with-photo", photoData);
    });
  });  