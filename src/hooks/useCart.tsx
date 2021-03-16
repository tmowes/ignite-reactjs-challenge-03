import { createContext, ReactNode, useContext, useState } from 'react';
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
    const storagedCart = localStorage.getItem(`${STORAGE_kEY}:cart`)

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const { data: stock } = await api.get<Stock>(`/stock/${productId}`)

      if (stock.amount <= 1) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      let productAlreadyInCart = cart.some(product => product.id === productId)
      let newCartState: Product[] = []

      if (!productAlreadyInCart) {
        const { data } = await api.get<Product>(`/products/${productId}`)

        newCartState = [
          ...cart,
          { ...data, amount: 1 },
        ]

        setCart(newCartState)

      } else {
        newCartState = cart.map(product => product.id !== productId ? product : {
          ...product,
          amount: product.amount + 1
        })
        setCart(newCartState)
      }

      localStorage.setItem(`${STORAGE_kEY}:cart`, JSON.stringify(newCartState))
    } catch {
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {

      let productAlreadyInCart = cart.some(product => product.id === productId)

      if (!productAlreadyInCart) {
        throw new Error('Produto não existe')
      }

      const newCartState = cart.filter(product => product.id !== productId)

      setCart(newCartState)

      localStorage.setItem(`${STORAGE_kEY}:cart`, JSON.stringify(newCartState))
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount === 0) {
        throw new Error('Quantidade inválida')
      }

      const { data: stock } = await api.get<Stock>(`/stock/${productId}`)

      if (stock.amount <= 1) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      const newCartState = cart.map(product => product.id !== productId ? product : {
        ...product,
        amount,
      })

      setCart(newCartState)

      localStorage.setItem(`${STORAGE_kEY}:cart`, JSON.stringify(newCartState))
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

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
