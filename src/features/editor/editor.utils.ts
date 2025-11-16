/**
      * Valide la taille d'une image base64
 * @param base64String - La chaîne base64 de l'image
 * @param maxSizeMB - La taille maximale en MB
 * @returns true si la taille est valide, false sinon
 */
export const validateImageSize = (base64String: string, maxSizeMB: number = 5): boolean => {
  const sizeInBytes = (base64String.length * 3) / 4;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  return sizeInBytes <= maxSizeBytes;
};

/**
 * Compresse une image base64 (réduction de qualité)
 */
export const compressImage = (base64String: string, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Redimensionner si nécessaire (max 1920px de largeur)
      const maxWidth = 1920;
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(img, 0, 0, width, height);

      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    img.src = base64String;
  });
};

/**
 * Crée un uploader d'images pour EditorJS
 */
export const createImageUploader = (maxSizeMB: number = 5) => ({
  uploadByFile: async (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        let base64String = reader.result as string;

        // Valider la taille
        if (!validateImageSize(base64String, maxSizeMB)) {
          // Compresser l'image si elle est trop grande
          base64String = await compressImage(base64String, 0.7);
        }

        resolve({
          success: 1,
          file: {
            url: base64String
          }
        });
      };
      reader.readAsDataURL(file);
    });
  },

  uploadByUrl: async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async () => {
          let base64String = reader.result as string;

          // Valider et compresser si nécessaire
          if (!validateImageSize(base64String, maxSizeMB)) {
            base64String = await compressImage(base64String, 0.7);
          }

          resolve({
            success: 1,
            file: {
              url: base64String
            }
          });
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      return {
        success: 0,
        error: 'Impossible de charger l\'image'
      };
    }
  }
});
