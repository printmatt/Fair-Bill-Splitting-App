import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useState } from 'react';
import Button from 'react-bootstrap/esm/Button';
import { Table } from 'react-bootstrap';

function SettlementModal({ settlements, show, onHide }) {

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Settlements</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Table hover responsive>
                    <thead>
                        <tr>
                            <th>From</th>
                            <th>To</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            settlements.map((element, index) => (
                                    <tr key={index}>
                                        <td>{element.From}</td>
                                        <td>{element.To}</td>
                                        <td>{'$' + element.Amount}</td>
                                    </tr>
                                ))
                        }
                    </tbody>
                </Table>
            </Modal.Body>
        </Modal>
    );
}

export default SettlementModal;