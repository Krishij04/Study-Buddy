import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaCamera, 
  FaUtensils, 
  FaChartBar, 
  FaPlus,
  FaInfoCircle,
  FaArrowRight
} from 'react-icons/fa';
import MealTracker from '../components/MealTracker';

const MealTrackerPage = () => {
  return (
    <Container className="meal-tracker-page">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <div className="section-header">
            <div className="title-wrapper">
              <FaUtensils className="title-icon" />
              <h1>Your Daily Nutrition</h1>
            </div>
            <p className="section-subtitle">
              Track your meals and monitor your nutrition goals
            </p>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-2">
              <FaChartBar className="stats-icon" />
              <h2 className="section-title">Today's Meals</h2>
            </div>
            <Link to="/log-food">
              <Button variant="primary" className="log-meal-btn">
                <FaCamera className="me-2" />
                Log New Meal
                <FaArrowRight className="ms-2" />
              </Button>
            </Link>
          </div>

          <MealTracker />
        </Col>
      </Row>
    </Container>
  );
};

export default MealTrackerPage;