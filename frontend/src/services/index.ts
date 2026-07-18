export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export { default as createComment } from './createComment';
export { default as getRootComments } from './getComments';
export { default as getReplies } from './getReplies';
export { default as uploadFile } from './uploadFile';
export { getCaptcha } from './captcha';
