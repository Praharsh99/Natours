import axios from 'axios';
import { showAlert } from './alerts';

var stripe = window.Stripe(
  'pk_test_51GzSBeFyUruRvBaubtQLTM8nxeooQDDlQN1hizgVmv8JdMd6Raffnpzem89NKacC2jZG7D0wkiNySE5fssFL2wWh00NouMwr9p'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2) create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    // console.log(err);
    showAlert('error', err);
  }
};
