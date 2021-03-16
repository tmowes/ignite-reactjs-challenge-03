import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';
import { STORAGE_kEY } from '../util';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    // const storagedCart = Buscar dados do localStorage

    // if (storagedCart) {
    //   return JSON.parse(storagedCart);
    // }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const { data: stock } = await api.get<Stock>(`/stock/${productId}`)

      if (stock.amount <= 0) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      let product = cart.find(product => product.id === productId)

      if (!product) {
        const { data } = await api.get<Product>(`/products/${productId}`)

        product = {
          ...data,
          amount: 1
        }



      }
      // TODO

      setCart([...cart, product])


    } catch {
      // TODO
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  useEffect(() => {
    localStorage.setItem(`${STORAGE_kEY}:cart`, JSON.stringify(cart))
  }, [cart])

  const providerValues = { cart, addProduct, removeProduct, updateProductAmount }

  return (
    <CartContext.Provider value={providerValues} >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
