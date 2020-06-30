/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (data, type, reload) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'Success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
      if (reload) location.reload(true);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
