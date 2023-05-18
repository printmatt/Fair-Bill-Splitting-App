import { ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useState } from 'react';

function BalanceList({ balances }) {
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleItemHover = (balance) => {
    setHoveredItem(balance.BalanceID);
  }

  const handleItemLeave = () => {
    setHoveredItem(null);
  }

  return (
    <ListGroup>
      {balances.map((balance) => (
        <Link to={`/balances/${balance.BalanceID}`} style={{ textDecoration: 'none' }}  >
          <ListGroup.Item
            key={balance.BalanceID}
            onMouseEnter={() => handleItemHover(balance)}
            onMouseLeave={() => handleItemLeave()}
            style={{
              backgroundColor: hoveredItem === balance.BalanceID ? '#D3D3D3' : '#f2f2f2'
            }}
          >
            {balance.Title} - {balance.Status ? "Resolved" : "In Process"}
          </ListGroup.Item>
        </Link>
      ))}
    </ListGroup>
  );
}

export default BalanceList;
