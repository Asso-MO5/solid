import { MetaProvider, Title } from '@solidjs/meta'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Suspense } from 'solid-js'
import './app.css'
import { Layout } from '~/ui/Layout/Layout'
import { Modal } from '~/ui/Modal/Modal'
import { WebSocketProvider } from '~/features/msg/ms'
import { auth } from './features/auth/auth.store'
import { msgHandlers } from './features/msg/msg-handlers'


export default function App() {

  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>Solid</Title>
          {auth?.id && <WebSocketProvider handlers={msgHandlers as { [key: string]: (room: string, action: string) => Promise<void> }} />}
          <Suspense fallback={<div class="h-[100dvh] flex items-center justify-center bg-bg" >Chargement...</div>} >
            <Layout>
              {props.children}
            </Layout>
            <Modal />
          </Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
