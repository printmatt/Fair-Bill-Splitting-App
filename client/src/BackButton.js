import React from 'react';
import { useNavigate } from 'react-router-dom';
import {IoIosArrowRoundBack} from 'react-icons/io';
import { Button } from 'react-bootstrap';

export default function BackButton({ handleBackButtonClicked }) {
  const navigate = useNavigate();

  return (
    <Button size = "lg" variant = "link" style={{ textDecoration: 'none', color : "black" }}  onClick={() => handleBackButtonClicked()}>
        <IoIosArrowRoundBack></IoIosArrowRoundBack>
        <span> Dashboard</span>
    </Button>
    
  );
}