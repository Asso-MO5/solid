// @refresh reload
import { MetaProvider, Title } from '@solidjs/meta'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Suspense } from 'solid-js'
import './app.css'
import { SessionProvider } from '@solid-mediakit/auth/client'
import { Layout } from '~/ui/Layout/Layout'
import { Modal } from '~/ui/Modal/Modal'

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>Solid</Title>
          <Suspense>
            <SessionProvider>
              <Layout>
                {props.children}
              </Layout>
              <Modal />
            </SessionProvider>
          </Suspense>

        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
