import React, { createContext } from 'react';
import { message } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';

interface MessageContextType {
    messageApi: MessageInstance;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

interface MessageProviderProps {
    children: React.ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
    const [messageApi, contextHolder] = message.useMessage();

    return (
        <MessageContext.Provider value={{ messageApi }}>
            {contextHolder}
            {children}
        </MessageContext.Provider>
    );
};

export const useMessage = (): MessageInstance => {
    const context = React.useContext(MessageContext);
    if (!context) {
        throw new Error('useMessage must be used within a MessageProvider');
    }
    return context.messageApi;
};
