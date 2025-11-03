import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Upload image to Firebase Storage
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const fileExtension = file.name.split('.').pop();
  const fileName = `products/${productId}.${fileExtension}`;
  const storageRef = ref(storage, fileName);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
}

// Delete image from Firebase Storage
export async function deleteProductImage(imageUrl: string): Promise<void> {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}
