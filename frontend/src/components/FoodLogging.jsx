import React, { useState } from 'react';
import { Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { 
  FaUpload, 
  FaTimes, 
  FaUtensils, 
  FaCamera, 
  FaInfoCircle,
  FaCheck,
  FaArrowLeft,
  FaArrowRight,
  FaImage,
  FaSearch,
  FaClock,
  FaChartBar,
  FaWeight,
  FaBreadSlice,
  FaHamburger,
  FaPizzaSlice,
  FaCookie
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './FoodLogging.css';

const FoodLogging = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [foodName, setFoodName] = useState('');
  const [mealtime, setMealtime] = useState('');
  
  const navigate = useNavigate();

  // API base URL - Updated to use port 5001 for the food ML service
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '' // Empty for production since they'll be served from the same origin
    : 'http://localhost:5001'; // Updated to port 5001 for the food ML service

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      // Call the predict endpoint on the new port
      const response = await axios.post(`${API_BASE_URL}/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Process the response from the backend
      const foodData = response.data;
      
      // Extract protein, carbs, and fats from the response if available,
      // otherwise use placeholders
      const displayName = foodName || foodData.food.replace(/_/g, ' ');
      
      // Format the result
      setResult({
        foodName: displayName,
        calories: foodData.is_piecewise ? foodData.calories_per_piece : foodData.total_calories,
        protein: foodData.protein || "15g", // Use API value if available
        carbs: foodData.carbs || "30g",     // Use API value if available
        fats: foodData.fats || "10g",       // Use API value if available
        detectedFood: foodData.food.replace(/_/g, ' '),
        isPiecewise: foodData.is_piecewise,
        mealtime: mealtime,
        imageUrl: previewUrl
      });
    }  catch (err) {
      console.log('Full error response:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError(`Failed to analyze food image: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFoodName('');
    setMealtime('');
    setResult(null);
    setError(null);
  };

  const handleLogMeal = () => {
    // Get existing meals from localStorage
    const existingMeals = JSON.parse(localStorage.getItem('loggedMeals')) || [];
    
    // Create a new meal object with unique ID
    const newMeal = {
      id: Date.now().toString(),
      foodName: result.foodName,
      calories: parseInt(result.calories),
      protein: result.protein,
      carbs: result.carbs,
      fats: result.fats,
      mealtime: result.mealtime,
      timestamp: Date.now(),
      imageUrl: result.imageUrl
    };
    
    // Add the new meal to the existing meals
    const updatedMeals = [...existingMeals, newMeal];
    
    // Save to localStorage
    localStorage.setItem('loggedMeals', JSON.stringify(updatedMeals));
    
    // Navigate to the meal tracker page
    navigate('/meal-tracker');
  };

  const getMealtimeIcon = (mealtime) => {
    switch (mealtime) {
      case 'breakfast':
        return <FaBreadSlice />;
      case 'lunch':
        return <FaHamburger />;
      case 'dinner':
        return <FaPizzaSlice />;
      case 'snack':
        return <FaCookie />;
      default:
        return <FaUtensils />;
    }
  };

  return (
    <Card className="food-logging-card">
      <Card.Body>
        <Card.Title className="d-flex align-items-center gap-2">
          <FaUtensils className="title-icon" />
          Log Your Food
        </Card.Title>
        
        {!result ? (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center gap-2">
                <FaCamera />
                Upload Food Image
                <FaInfoCircle className="info-icon" title="Upload a clear photo of your food" />
              </Form.Label>
              <div className="file-upload-container">
                <label htmlFor="file-upload" className="file-upload-label">
                  <FaUpload className="upload-icon" />
                  Choose a food image
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="file-upload-input"
                />
              </div>

              {previewUrl && (
                <div className="file-preview-container">
                  <img
                    src={previewUrl}
                    alt="Food preview"
                    className="img-fluid"
                  />
                  <button
                    type="button"
                    className="clear-preview-btn"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    <FaTimes className="clear-icon" />
                  </button>
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center gap-2">
                <FaSearch />
                Food Name (Optional)
                <FaInfoCircle className="info-icon" title="Override the detected food name if needed" />
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter food name if you want to override detection"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="d-flex align-items-center gap-2">
                <FaClock />
                Mealtime
                <FaInfoCircle className="info-icon" title="Select when you're having this meal" />
              </Form.Label>
              <Form.Select
                value={mealtime}
                onChange={(e) => setMealtime(e.target.value)}
              >
                <option value="">Select mealtime</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </Form.Select>
            </Form.Group>

            {error && <Alert variant="danger">{error}</Alert>}

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !selectedFile}
              className="w-100 d-flex align-items-center justify-content-center gap-2"
            >
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FaUpload />
                  Analyze Food
                </>
              )}
            </Button>
          </Form>
        ) : (
          <div className="analysis-results">
            <h5 className="d-flex align-items-center gap-2">
              <FaChartBar />
              Analysis Results
            </h5>
            <div className="macro-list">
              <li>
                <strong>Food Name:</strong> {result.foodName}
              </li>
              {result.foodName !== result.detectedFood && (
                <li>
                  <strong>Detected Food:</strong> {result.detectedFood}
                </li>
              )}
              <li>
                <strong>Calories:</strong> {result.calories} kcal
                {result.isPiecewise && <span className="text-muted"> (per piece)</span>}
              </li>
              <li>
                <strong>Protein:</strong> {result.protein}
              </li>
              <li>
                <strong>Carbohydrates:</strong> {result.carbs}
              </li>
              <li>
                <strong>Fats:</strong> {result.fats}
              </li>
              {result.mealtime && (
                <li>
                  <strong>Meal:</strong> {result.mealtime.charAt(0).toUpperCase() + result.mealtime.slice(1)}
                  <span className="ms-2">{getMealtimeIcon(result.mealtime)}</span>
                </li>
              )}
            </div>
            <div className="d-flex gap-2 mt-4">
              <Button 
                variant="success" 
                className="flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                onClick={handleLogMeal}
              >
                <FaCheck />
                Log This Meal
              </Button>
              <Button 
                variant="outline-secondary" 
                className="d-flex align-items-center gap-2"
                onClick={handleReset}
              >
                <FaArrowLeft />
                Try Another
              </Button>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default FoodLogging;