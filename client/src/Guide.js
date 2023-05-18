import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

function Guide({title, subtitle, text, clickAction, guideRoute}) {
  return (
    <Card style={{ width: '18rem'}} bg="light" key="light">
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{subtitle}</Card.Subtitle>
        <Card.Text>
          {text}
        </Card.Text>
        <Button variant="primary" onClick={clickAction}>{guideRoute}</Button>{' '}
      </Card.Body>
    </Card>
  );
}

export default Guide;