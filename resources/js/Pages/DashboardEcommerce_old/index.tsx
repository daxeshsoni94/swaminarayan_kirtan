import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Col, Container, Row } from 'react-bootstrap';

import Layout from '../../Layouts';
import Section from './Section';

export default function Dashboard() {

  const [rightColumn, setRightColumn] = useState<boolean>(true);
  const toggleRightColumn = () => {
    setRightColumn(!rightColumn);
  };

  return (
    <React.Fragment>
      <Head title='Dashboard | Webtwine' />
      <div className="page-content">
        <Container fluid>
          <Row>
            <Col>
              <div className="h-100">
                <Section rightClickBtn={toggleRightColumn} />
                <Row>
                </Row>
                <Row>
                  <Col xl={8}>
                  </Col>
                </Row>
                <Row>
                </Row>
                <Row>
                </Row>
              </div>
            </Col>
          </Row>
        </Container >
      </div >
    </React.Fragment >
  );
}
Dashboard.layout = (page: any) => <Layout children={page} />;