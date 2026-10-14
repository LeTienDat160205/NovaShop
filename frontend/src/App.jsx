import React, { Fragment } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { routes } from './routes'
import HeaderCompoment from './components/HeaderComponent/HeaderComponent'
import DefaultCompoment from './components/DefaultComponent/DefaultComponent'
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import AdminRoute from './components/AdminRoute/AdminRoute';

function App() {
  return (
    <div>
      <Router>
        <ScrollToTop />
        <Routes>
          {routes.map((route) => {
            const Page = route.page
            const Layout = route.isShowHeader ? DefaultCompoment : Fragment
            const element = (
              <Layout>
                <Page/>
              </Layout>
            )
            return (
              <Route 
                key={route.path} 
                path={route.path} 
                element={route.isAdmin ? <AdminRoute>{element}</AdminRoute> : element}
              />
            )
          })}
        </Routes>
      </Router>
    </div>
  )
}

export default App 
