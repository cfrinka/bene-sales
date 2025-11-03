import { db } from './firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  Timestamp,
  runTransaction,
  writeBatch,
} from 'firebase/firestore';
import { Product, Sale } from '@/types';

// Products Collection
const productsCollection = collection(db, 'estoque');
const salesCollection = collection(db, 'sales');

// Get all products
export async function getProducts(): Promise<Product[]> {
  const q = query(productsCollection, orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Product[];
}

// Get single product
export async function getProduct(id: string): Promise<Product | null> {
  const docRef = doc(db, 'estoque', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    } as Product;
  }
  return null;
}

// Add product
export async function addProduct(
  product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(productsCollection, {
    ...product,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

// Update product
export async function updateProduct(
  id: string,
  product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const docRef = doc(db, 'estoque', id);
  await updateDoc(docRef, {
    ...product,
    updatedAt: Timestamp.now(),
  });
}

// Delete product
export async function deleteProduct(id: string): Promise<void> {
  const docRef = doc(db, 'estoque', id);
  await deleteDoc(docRef);
}

// Process sale with transaction (ensures stock is updated atomically)
export async function processSale(
  productId: string,
  size: string,
  quantity: number
): Promise<string> {
  return await runTransaction(db, async (transaction) => {
    const productRef = doc(db, 'estoque', productId);
    const productDoc = await transaction.get(productRef);

    if (!productDoc.exists()) {
      throw new Error('Produto não encontrado');
    }

    const product = productDoc.data() as Product;
    const currentStock = product.sizes[size] || 0;

    if (currentStock < quantity) {
      throw new Error(`Estoque insuficiente. Disponível: ${currentStock}`);
    }

    // Update stock
    const newSizes = { ...product.sizes };
    newSizes[size] = currentStock - quantity;

    transaction.update(productRef, {
      sizes: newSizes,
      updatedAt: Timestamp.now(),
    });

    // Create sale record
    const saleRef = doc(collection(db, 'sales'));
    transaction.set(saleRef, {
      productId,
      productName: product.name,
      size,
      quantity,
      price: product.price,
      total: product.price * quantity,
      timestamp: Timestamp.now(),
    });

    return saleRef.id;
  });
}

// Get sales history
export async function getSales(): Promise<Sale[]> {
  const q = query(salesCollection, orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate(),
  })) as Sale[];
}

// Clear all sales history
export async function clearSalesHistory(): Promise<void> {
  const snapshot = await getDocs(salesCollection);
  const batch = writeBatch(db);
  
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
}

// Generate dummy sales data for testing
export async function generateDummyData(): Promise<void> {
  const products = await getProducts();
  if (products.length === 0) {
    throw new Error('Adicione produtos primeiro');
  }

  const sizes = ['P', 'M', 'G', 'GG', 'G1'];
  const batch = writeBatch(db);
  const now = new Date();

  // Generate 15 sales for today
  for (let i = 0; i < 15; i++) {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
    const randomQuantity = Math.floor(Math.random() * 3) + 1;
    
    const saleDate = new Date(now);
    saleDate.setHours(Math.floor(Math.random() * 24));
    saleDate.setMinutes(Math.floor(Math.random() * 60));

    const saleRef = doc(collection(db, 'sales'));
    batch.set(saleRef, {
      productId: randomProduct.id,
      productName: randomProduct.name,
      size: randomSize,
      quantity: randomQuantity,
      price: randomProduct.price,
      total: randomProduct.price * randomQuantity,
      timestamp: Timestamp.fromDate(saleDate),
    });
  }

  // Generate 10 sales for yesterday
  for (let i = 0; i < 10; i++) {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
    const randomQuantity = Math.floor(Math.random() * 3) + 1;
    
    const saleDate = new Date(now);
    saleDate.setDate(saleDate.getDate() - 1);
    saleDate.setHours(Math.floor(Math.random() * 24));
    saleDate.setMinutes(Math.floor(Math.random() * 60));

    const saleRef = doc(collection(db, 'sales'));
    batch.set(saleRef, {
      productId: randomProduct.id,
      productName: randomProduct.name,
      size: randomSize,
      quantity: randomQuantity,
      price: randomProduct.price,
      total: randomProduct.price * randomQuantity,
      timestamp: Timestamp.fromDate(saleDate),
    });
  }

  await batch.commit();
}
