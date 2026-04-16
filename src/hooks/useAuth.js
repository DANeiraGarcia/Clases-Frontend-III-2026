import { useContext } from 'react';

import { AuthContext } from '../context/AuthContext';

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.'); // si el contexto no trae nada manda el error.
  }

  return context;
}

export default useAuth;