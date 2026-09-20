import React, { Fragment } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { routes } from './routes'
import HeaderCompoment from './components/HeaderComponent/HeaderComponent'
import DefaultCompoment from './components/DefaultComponent/DefaultComponent'
function App() {


  return (
    <div>
      <Router>
        <Routes>
          {routes.map((route) => {
            const Page = route.page
            const Layout = route.isShowHeader ? DefaultCompoment : Fragment
            return (
              <Route key={route.path} path={route.path} element={
                <Layout>
                  <Page/>
                </Layout>
              }/>
            )
          })}
        </Routes>
      </Router>
    </div>
  )
}

export default App 
