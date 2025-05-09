import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Spin } from 'antd';
import { ApolloProvider } from '@apollo/client';
import client from './graphql/client';
import routes from './config/routes';
import ProtectedRoute from './components/common/ProtectedRoute';
import './styles/global.scss';

const App: React.FC = () => {
    return (
        <ApolloProvider client={client}>
            <Router>
                <Suspense
                    fallback={
                        <div className="loading-container">
                            <Spin size="large" />
                        </div>
                    }
                >
                    <Routes>
                        {routes.map(route => (
                            <Route
                                key={route.path}
                                path={route.path}
                                element={
                                    route.protected ? (
                                        <ProtectedRoute>
                                            <route.component />
                                        </ProtectedRoute>
                                    ) : (
                                        <route.component />
                                    )
                                }
                            />
                        ))}
                    </Routes>
                </Suspense>
            </Router>
        </ApolloProvider>
    );
};

export default App
