import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
    id: number;
    plan_id?: number;
    plan_name?: string;
    name: string;
    price: number;
    image?: string;
    app_name?: string;
    quantity: number;
}

interface CartContextType {
    updateQuantity: (id: number, quantity: number, plan_id?: number) => void;
    items: CartItem[];
    addToCart: (item: any) => void;
    removeFromCart: (id: number, plan_id?: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem('emerite_cart');
        try {
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to parse cart from storage', e);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('emerite_cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (product: any) => {
        setItems((prev) => {
            const existing = prev.find((item) => item.id === product.id && item.plan_id === product.plan_id);
            if (existing) {
                return prev.map((item) =>
                    (item.id === product.id && item.plan_id === product.plan_id) ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1, price: product.price || 0 }];
        });
    };

    const removeFromCart = (id: number, plan_id?: number) => {
        setItems((prev) => prev.filter((item) => !(item.id === id && item.plan_id === plan_id)));
    };

    const clearCart = () => setItems([]);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const updateQuantity = (id: number, quantity: number, plan_id?: number) => {
        setItems((prev) =>
            prev.map(item =>
                (item.id === id && item.plan_id === plan_id) ? { ...item, quantity: Math.max(1, quantity) } : item
            )
        );
    };

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
