import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';

function CopyButton({ url }) {
  const [copySuccess, setCopySuccess] = useState('');
  const [variantState, setVariantState] = useState('info');

  const handleCopyClick = () => {
    navigator.clipboard.writeText(url);
    setCopySuccess('Copied!');
    setVariantState('success');
  };

  return (
    <Button variant={variantState} onClick={handleCopyClick}>
      {copySuccess ? copySuccess : 'Copy Invite Link'}
    </Button>
  );
}

export default CopyButton;
