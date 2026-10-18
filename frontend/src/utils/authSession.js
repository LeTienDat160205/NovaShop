export const getAuthSession = () => {
  const token = localStorage.getItem('novashop_token');
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('novashop_user') || 'null');
    } catch {
      return null;
    }
  })();

  return {
    token,
    user,
    userId: String(user?.id || user?._id || ''),
    role: user?.role || null,
  };
};

export const clearAuthSession = () => {
  localStorage.removeItem('novashop_token');
  localStorage.removeItem('novashop_user');
  window.dispatchEvent(new Event('novashop-auth-changed'));
};
