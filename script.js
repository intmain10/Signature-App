document.addEventListener("DOMContentLoaded", () => {
    const canvas = new fabric.Canvas('signature-canvas', {
        isDrawingMode: true,
        backgroundColor: 'white',
        width: 800,
        height: 600,
    });

    const clearBtn = document.getElementById('clear-btn');
    const saveBtn = document.getElementById('save-btn');
    const downloadImgBtn = document.getElementById('download-img-btn');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    const resultImg = document.getElementById('result');
    const penType = document.getElementById('pen-type');
    const colorPicker = document.getElementById('color-picker');
    const imageUpload = document.getElementById('image-upload');

    // Set initial drawing settings
    canvas.freeDrawingBrush.width = parseInt(penType.value);
    canvas.freeDrawingBrush.color = colorPicker.value;

    penType.addEventListener('change', () => {
        canvas.freeDrawingBrush.width = parseInt(penType.value);
    });

    colorPicker.addEventListener('change', () => {
        canvas.freeDrawingBrush.color = colorPicker.value;
    });

    clearBtn.addEventListener('click', () => {
        canvas.clear();
        canvas.backgroundColor = 'white';
    });

    saveBtn.addEventListener('click', async () => {
        const dataURL = canvas.toDataURL({
            format: 'jpeg',
            quality: 1.0 // Maximum quality
        });
        const cleanedSignature = await removeBackground(dataURL);
        if (cleanedSignature) {
            resultImg.src = cleanedSignature;
            resultImg.style.display = 'block';
        } else {
            alert('Failed to remove background from the signature.');
        }
    });

    downloadImgBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = resultImg.src;
        link.download = 'signature.jpg'; // Set file name to .jpg extension
        link.click();
    });

    downloadPdfBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        const image = new Image();
        image.src = resultImg.src;
        image.onload = () => {
            pdf.addImage(image, 'JPEG', 10, 10, 180, 160); // Use 'JPEG' format
            pdf.save('signature.pdf');
        };
    });

    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    canvas.setBackgroundImage(new fabric.Image(img), canvas.renderAll.bind(canvas));
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    });

    async function removeBackground(imageData) {
        const apiKey = 'k6wDYn8LX8SMp8efbtVcWmFY'; // Replace 'YOUR_REMOVE_BG_API_KEY' with your actual API key
        const formData = new FormData();
        formData.append('image_file_b64', imageData.split(',')[1]);

        try {
            const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                method: 'POST',
                headers: {
                    'X-Api-Key': apiKey
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response from remove.bg:', errorText);
                return null;
            }

            const blob = await response.blob();
            const reader = new FileReader();
            return new Promise((resolve, reject) => {
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error removing background:', error);
            return null;
        }
    }
});
