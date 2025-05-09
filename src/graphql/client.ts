import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import useAuthStore  from '../store/authStore';
import env from '../config/environment';

const httpLink = createHttpLink({
    uri: env.API_URL,
});

const authLink = setContext((_, { headers }) => {
    const token = useAuthStore.getState().token;

    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
        },
    };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, extensions }) => {
            debugger
            if (extensions?.code === 'UNAUTHENTICATED') {
                // Token không hợp lệ hoặc hết hạn
                useAuthStore.getState().logout();
                window.location.href = '/login';
            }
        });
    }

    if (networkError) {
        console.log(`[Network error]: ${networkError}`);
    }
});

export default new ApolloClient({
    link: from([authLink, errorLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
        },
        query: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
        },
    },
});
