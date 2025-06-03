import { firebaseStorage, ref, uploadBytes, getDownloadURL, deleteObject } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';

export const uploadImageToFirebase = async (file: File): Promise<string> => {
    try {
        const fileName = `recipes/${uuidv4()}_${file.name}`;
        const storageRef = ref(firebaseStorage, fileName);

        const snapshot = await uploadBytes(storageRef, file)
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error
    }
}

export const deleteImageFromFirebase = async (imageUrl: string): Promise<void> => {
    try {
        if (!imageUrl || !imageUrl.includes('firebasestorage.googleapis.com')) {
            console.log('Invalid Firebase URL, skipping delete');
            return;
        }
        
        // Cách 1: Extract path từ URL
        const url = new URL(imageUrl);
        const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
        
        if (!pathMatch) {
            console.error('Could not extract path from URL:', imageUrl);
            return;
        }
        
        const filePath = decodeURIComponent(pathMatch[1]);
        console.log('Deleting file at path:', filePath);
        
        const storageRef = ref(firebaseStorage, filePath);
        await deleteObject(storageRef);
        
        console.log('Successfully deleted image from Firebase');
    } catch (error) {{
        console.error('Error deleting image:', error);
        throw error;
    }}
}

// Alternative method - Lưu path khi upload
export const uploadImageToFirebaseWithPath = async (file: File): Promise<{ url: string; path: string }> => {
    try {
        const fileName = `recipes/${uuidv4()}_${file.name}`;
        const storageRef = ref(firebaseStorage, fileName);
        
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return {
            url: downloadURL,
            path: fileName // Trả về path để dễ dàng xóa sau này
        };
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

export const deleteImageByPath = async (path: string): Promise<void> => {
    try {
        if (!path) return;
        
        const storageRef = ref(firebaseStorage, path);
        await deleteObject(storageRef);
        
        console.log('Successfully deleted image at path:', path);
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
};