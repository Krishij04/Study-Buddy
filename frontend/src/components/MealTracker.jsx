import React, { useState, useEffect } from 'react';
import { Card, ListGroup, ProgressBar, Button, Container, Row, Col, Badge } from 'react-bootstrap';
import { FaUtensils, FaTrash, FaHistory } from 'react-icons/fa';

const MealTracker = () => {
  // State to store logged meals
  const [loggedMeals, setLoggedMeals] = useState([]);
  // Daily calorie goal (could be set based on user preferences)
  const [calorieGoal, setCalorieGoal] = useState(2000);
  // Current date
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }));

  // Get meals from localStorage on component mount
  useEffect(() => {
    const savedMeals = localStorage.getItem('loggedMeals');
    if (savedMeals) {
      setLoggedMeals(JSON.parse(savedMeals));
    }
    
    const savedGoal = localStorage.getItem('calorieGoal');
    if (savedGoal) {
      setCalorieGoal(parseInt(savedGoal));
    }
  }, []);

  // Save meals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('loggedMeals', JSON.stringify(loggedMeals));
  }, [loggedMeals]);

  // Calculate total calories consumed
  const totalCalories = loggedMeals.reduce((total, meal) => total + meal.calories, 0);
  
  // Calculate percentage of daily goal
  const caloriePercentage = Math.min(Math.round((totalCalories / calorieGoal) * 100), 100);

  // Generate progress bar variant based on percentage
  const getProgressVariant = () => {
    if (caloriePercentage < 50) return 'success';
    if (caloriePercentage < 85) return 'warning';
    return 'danger';
  };

  // Handle removing a meal
  const handleRemoveMeal = (mealId) => {
    setLoggedMeals(loggedMeals.filter(meal => meal.id !== mealId));
  };

  // Handle updating the calorie goal
  const handleUpdateGoal = (newGoal) => {
    setCalorieGoal(newGoal);
    localStorage.setItem('calorieGoal', newGoal);
  };

  // Group meals by mealtime
  const mealsByTime = {
    breakfast: loggedMeals.filter(meal => meal.mealtime === 'breakfast'),
    lunch: loggedMeals.filter(meal => meal.mealtime === 'lunch'),
    dinner: loggedMeals.filter(meal => meal.mealtime === 'dinner'),
    snack: loggedMeals.filter(meal => meal.mealtime === 'snack'),
    other: loggedMeals.filter(meal => !meal.mealtime || meal.mealtime === '')
  };

  // Format time from timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Container className="meal-tracker py-4">
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title className="d-flex justify-content-between align-items-center">
            <span><FaUtensils className="me-2" />Daily Meal Tracker</span>
            <span className="text-muted fs-6">{currentDate}</span>
          </Card.Title>
          
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>Daily Goal: {calorieGoal} calories</span>
              <span className="fw-bold">
                {totalCalories} / {calorieGoal} cal ({caloriePercentage}%)
              </span>
            </div>
            <ProgressBar 
              now={caloriePercentage} 
              variant={getProgressVariant()} 
              className="calorie-progress" 
            />
          </div>

          {loggedMeals.length === 0 ? (
            <div className="text-center my-5 py-3 text-muted">
              <FaHistory size={30} className="mb-3" />
              <h5>No meals logged today</h5>
              <p>Upload a food photo to start tracking your meals</p>
            </div>
          ) : (
            <>
              {['breakfast', 'lunch', 'dinner', 'snack', 'other'].map((mealtime) => {
                if (mealsByTime[mealtime].length === 0) return null;
                
                return (
                  <div key={mealtime} className="mb-4">
                    <h5 className="meal-category-header">
                      {mealtime.charAt(0).toUpperCase() + mealtime.slice(1)}
                      <Badge bg="info" className="ms-2">
                        {mealsByTime[mealtime].reduce((sum, meal) => sum + meal.calories, 0)} cal
                      </Badge>
                    </h5>
                    <ListGroup variant="flush">
                      {mealsByTime[mealtime].map((meal) => (
                        <ListGroup.Item key={meal.id} className="d-flex justify-content-between align-items-center">
                          <div className="meal-info">
                            <div className="d-flex align-items-center">
                              {meal.imageUrl && (
                                <div className="meal-image-small me-3">
                                  <img 
                                    src={meal.imageUrl} 
                                    alt={meal.foodName} 
                                    className="rounded"
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                  />
                                </div>
                              )}
                              <div>
                                <div className="fw-bold">{meal.foodName}</div>
                                <div className="text-muted small">{formatTime(meal.timestamp)}</div>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex align-items-center">
                            <span className="me-3">{meal.calories} cal</span>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleRemoveMeal(meal.id)}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                );
              })}
            </>
          )}
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>Nutrition Summary</Card.Title>
          <Row>
            <Col md={4} className="text-center mb-3">
              <div className="nutrition-stat">
                <h3>{totalCalories}</h3>
                <div>Calories</div>
              </div>
            </Col>
            <Col md={4} className="text-center mb-3">
              <div className="nutrition-stat">
                <h3>{loggedMeals.reduce((sum, meal) => sum + (parseInt(meal.protein) || 0), 0)}g</h3>
                <div>Protein</div>
              </div>
            </Col>
            <Col md={4} className="text-center mb-3">
              <div className="nutrition-stat">
                <h3>{loggedMeals.reduce((sum, meal) => sum + (parseInt(meal.carbs) || 0), 0)}g</h3>
                <div>Carbs</div>
              </div>
            </Col>
            <Col md={4} className="text-center mb-3">
              <div className="nutrition-stat">
                <h3>{loggedMeals.reduce((sum, meal) => sum + (parseInt(meal.fats) || 0), 0)}g</h3>
                <div>Fats</div>
              </div>
            </Col>
            <Col md={4} className="text-center mb-3">
              <div className="nutrition-stat">
                <h3>{loggedMeals.length}</h3>
                <div>Meals</div>
              </div>
            </Col>
            <Col md={4} className="text-center mb-3">
              <div className="nutrition-stat">
                <h3>{calorieGoal - totalCalories}</h3>
                <div>Remaining</div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MealTracker;