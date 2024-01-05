import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals'
import ApolloClient from 'apollo-boost'
import {ApolloProvider} from '@apollo/react-hooks'
import {WebProvider} from './context/WebProvider'

const client: any = new ApolloClient({
  uri: 'https://izba-server.onrender.com/graphql'
})

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)

root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <WebProvider>
        <App />
      </WebProvider>
    </ApolloProvider>
  </React.StrictMode>
)

reportWebVitals();
