import BuyForm from '../components/BuyForm';
import SellForm from '../components/SellForm';

function Trading() {
  return (
    <div className="dashboard-grid">
      <BuyForm />
      <SellForm />
    </div>
  );
}

export default Trading;