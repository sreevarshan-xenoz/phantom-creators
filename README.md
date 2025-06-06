# Phantom Creators

A cutting-edge 3D printing simulation and visualization platform with a cyberpunk aesthetic.

## Features

- **Interactive 3D Model Visualization**: Upload and view STL files with realistic material rendering
- **Complexity Analysis**: Analyze models for printability and estimate print time
- **Material Simulation**: Visualize models with different materials (plastic, metal, ceramic, rubber)
- **Performance Optimizations**: Adaptive rendering with LOD (Level of Detail) for smooth performance
- **State Management**: Robust state machine for print process simulation
- **Documentation System**: Built-in help with keyboard shortcuts and tooltips
- **Accessibility**: Reduced motion support, ARIA attributes, and keyboard navigation
- **Demo Mode**: Try out the application with pre-loaded models without uploading files

## Technical Implementation

- **Performance**: Optimized animations with requestAnimationFrame and IntersectionObserver
- **Responsive Design**: Adaptive UI for different screen sizes and devices
- **Modular Architecture**: Component-based design for easy maintenance
- **Error Handling**: Comprehensive error validation and user-friendly messages
- **Accessibility**: ARIA attributes, keyboard navigation, and reduced motion support
- **Theme Support**: Light and dark mode with system preference detection

## Getting Started

1. Clone the repository
2. Open `index.html` in your browser
3. Try the demo mode by clicking "Try Demo Models" or upload your own STL file
4. Explore the model with different materials and analyze its complexity

## Demo Mode

The application includes a demo mode that lets you try out all features without uploading any files:

- Click on the "Try Demo Models" button or "Demo Models" in the navbar
- Select from various sample models (cube, sphere, gyroid, vase)
- Each model has different complexity levels and print time estimates
- Experiment with materials and visualizations using the sample models
- Share specific demo models via URL by using the `?demo=modelname` parameter

Keyboard shortcut: Press `Ctrl+D` to open the demo models panel.

## Development

### Installation

```bash
# Install dependencies
npm install
```

### Development Server

```bash
# Start local development server
npm start
```

The development server will be available at http://localhost:8080.

### Testing

```bash
# Run unit tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode during development
npm run test:watch
```

### Linting

```bash
# Run ESLint to check code quality
npm run lint
```

### Deployment

```bash
# Deploy to local environment
node deploy.js

# Deploy to staging environment
DEPLOY_TARGET=staging node deploy.js

# Deploy to production environment (requires confirmation)
DEPLOY_TARGET=production CONFIRM=true node deploy.js
```

## Keyboard Shortcuts

- `Ctrl + /`: Toggle documentation
- `Ctrl + Alt + M`: Toggle material view
- `Ctrl + P`: Start/pause print
- `Ctrl + D`: Open demo models panel
- `Esc`: Close current dialog
- `Ctrl + Z`: Reset view
- `F3`: Toggle performance monitor

## Material Properties

The visualization supports different material properties that can be adjusted:

- **Opacity**: Control the transparency of the material
- **Metalness**: Adjust how metallic the material appears
- **Roughness**: Control the surface roughness, affecting light reflection

## Performance Monitoring

Press the `F3` key to toggle the performance monitoring panel, which displays:

- Current FPS (Frames Per Second)
- Memory usage
- Render time for complex operations

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Future Enhancements

- WebGL rendering for even better performance
- Multi-model support for comparing prints
- Print settings adjustment with real-time feedback
- Integration with slicing tools
- AR/VR visualization support

## Credits

- Three.js for 3D rendering
- Cyberpunk-inspired UI design

## License

MIT License
