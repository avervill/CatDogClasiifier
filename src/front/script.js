document.getElementById('imageInput').addEventListener('change', function(event) {
    console.log('Image input changed, files:', event.target.files);
    const file = event.target.files[0];
    if (file) {
        console.log('File selected:', file.name, 'type:', file.type, 'size:', file.size);
        const reader = new FileReader();
        reader.onload = function(e) {
            console.log('Image loaded, setting preview');
            const img = document.getElementById('imagePreview');
            img.src = e.target.result;
            img.style.display = 'block';
            img.classList.add('fade-in');
            // Hide results when new image is selected
            // hideResults(); // Temporarily commented out for debugging
            // Classify automatically after upload
            console.log('Starting classification...');
            classifyImage(file);
        };
        reader.onerror = function(e) {
            console.error('Error reading file:', e);
            showError('Error reading the selected file');
        };
        reader.readAsDataURL(file);
    } else {
        console.log('No file selected');
    }
});

function classifyImage(file) {
    console.log('classifyImage called with file:', file);
    // Show loading
    showLoading();

    const formData = new FormData();
    formData.append('file', file);
    console.log('FormData created, entries:');
    for (let [key, value] of formData.entries()) {
        console.log('  ', key, ':', value);
    }

    fetch('/predict', {
        method: 'POST',
        body: formData,
        headers: {
            // Don't set Content-Type for FormData, let browser set it with boundary
        }
    })
    .then(response => {
        console.log('Response received:', response);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const contentType = response.headers.get('content-type');
        console.log('Response content-type:', contentType);
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        } else {
            return response.text().then(text => {
                console.log('Received non-JSON response:', text);
                throw new Error('Server returned non-JSON response: ' + text.substring(0, 200));
            });
        }
    })
    .then(data => {
        console.log('API Response:', data);
        hideLoading();
        if (data.error) {
            console.log('API returned error:', data.error);
            showError('Error: ' + data.error);
        } else {
            console.log('Calling displayResults with:', data.prediction, data.probability);
            displayResults(data.prediction, data.probability);
        }
        showResults();
    })
    .catch(error => {
        console.error('Fetch error:', error);
        hideLoading();
        showError('Error: Unable to connect to backend');
        showResults();
    });
}

function displayResults(prediction, probability) {
    console.log('Displaying results:', prediction, probability);
    
    // Update prediction block
    const predictionIcon = document.getElementById('predictionIcon');
    const predictionText = document.getElementById('predictionText');
    
    console.log('Prediction elements found:', !!predictionIcon, !!predictionText);
    
    if (!predictionIcon || !predictionText) {
        console.error('Prediction elements not found!');
        return;
    }
    
    // Simple text update
    predictionText.textContent = prediction.toUpperCase();
    predictionIcon.textContent = prediction.toLowerCase() === 'cat' ? '🐱' : '🐶';
    
    console.log('Updated prediction text to:', predictionText.textContent);
    console.log('Updated prediction icon to:', predictionIcon.textContent);
    
    // Update probability
    const percentageText = document.getElementById('percentageText');
    if (percentageText) {
        percentageText.textContent = probability.toFixed(2);
        console.log('Updated percentage to:', percentageText.textContent);
    }
    
    // Update labels
    updateProbabilityLabels(prediction.toLowerCase());
}

function animateCircularProgress(percentage) {
    const percentageText = document.getElementById('percentageText');
    if (percentageText) {
        percentageText.textContent = percentage + '%';
        console.log('Animated percentage to:', percentage + '%');
    }
}

function updateProbabilityLabels(prediction) {
    console.log('Updating labels for prediction:', prediction);
    const labelCat = document.querySelector('.label-cat');
    const labelDog = document.querySelector('.label-dog');
    
    if (labelCat && labelDog) {
        labelCat.classList.remove('active');
        labelDog.classList.remove('active');
        
        if (prediction === 'cat') {
            labelCat.classList.add('active');
            console.log('Added active class to cat label');
        } else {
            labelDog.classList.add('active');
            console.log('Added active class to dog label');
        }
    } else {
        console.error('Label elements not found');
    }
}

function showError(message) {
    console.log('Showing error:', message);
    // For error display, show a generic prediction
    const predictionIcon = document.getElementById('predictionIcon');
    const predictionText = document.getElementById('predictionText');
    const percentageText = document.getElementById('percentageText');
    
    if (predictionIcon) predictionIcon.textContent = '❌';
    if (predictionText) predictionText.textContent = 'ERROR';
    if (percentageText) percentageText.textContent = '0.00';
    
    console.log('Error displayed in UI');
}

function hideResults() {
    const results = document.getElementById('results');
    results.style.display = 'none';
    results.classList.remove('fade-in');
}

function showResults() {
    console.log('Showing results');
    const results = document.getElementById('results');
    if (results) {
        results.style.display = 'block';
        results.classList.add('fade-in');
        console.log('Results shown successfully');
    } else {
        console.error('Results element not found');
    }
}

// Loading functions
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'block';
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    const uploadBtn = document.querySelector('.upload-btn');
    const container = document.querySelector('.container');
    const imageInput = document.getElementById('imageInput');
    
    // Initialize circular progress to 0
    const progressCircle = document.querySelector('.progress-circle');
    if (progressCircle) {
        progressCircle.style.setProperty('--progress-angle', '0deg');
    }

    // Make sure the upload button works
    // uploadBtn.addEventListener('click', function() {
    //     console.log('Upload button clicked');
    //     imageInput.click();
    // });

    // Add click animation to upload button
    uploadBtn.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });

    // Add subtle animation on container hover
    container.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
    });

    container.addEventListener('mouseleave', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
    });
});