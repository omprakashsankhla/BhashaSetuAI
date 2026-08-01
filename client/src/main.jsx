// Safe patch to prevent third-party oauth libraries from crashing the app during script cleanup
if (typeof window !== 'undefined' && window.Node) {
  const originalRemoveChild = window.Node.prototype.removeChild;
  window.Node.prototype.removeChild = function(child) {
    if (child && child.parentNode !== this) {
      console.warn("removeChild: Node to be removed is not a child of this parent node, ignoring.", child);
      return child;
    }
    return originalRemoveChild.call(this, child);
  };
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './theme.css'
import './i18n'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('BhashaSetu is ready to work offline.')
  },
})

createRoot(document.getElementById('root')).render(
  <App />
)
