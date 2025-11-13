# Frontend Documentation Index

Welcome to the FrontEndBookOfRa documentation! This directory contains comprehensive guides and references for understanding the slot game frontend architecture.

## Documentation Files

### Core Component Guides

1. **[MIDDLE_SECTION_GUIDE.md](./MIDDLE_SECTION_GUIDE.md)**
   - Dynamic paytable component
   - PayCell and LowPayCell components
   - Layout structure and data flow
   - Styling and configuration

2. **[SLOT_MACHINE_GUIDE.md](./SLOT_MACHINE_GUIDE.md)**
   - Main game logic component
   - Spin handling and animations
   - Feature games (free spins, action games)
   - State management and API integration

3. **[CONTROL_PANEL_GUIDE.md](./CONTROL_PANEL_GUIDE.md)**
   - User interface controls
   - Bet management
   - Spin button states
   - Dialog integration
   - Responsive layouts

4. **[REEL_SYSTEM_GUIDE.md](./REEL_SYSTEM_GUIDE.md)**
   - ReelColumn component
   - SymbolDisplay component
   - PaylineNumbers component
   - WinningLinesDisplay component
   - Animation system

### System Guides

5. **[API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)**
   - Backend API communication
   - Request/response formats
   - Error handling
   - Session management
   - Usage examples

6. **[CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md)**
   - Game configuration structure
   - JSON file format
   - Bet-specific data
   - Symbol and payline configuration
   - Loading and validation

7. **[STATE_MANAGEMENT_GUIDE.md](./STATE_MANAGEMENT_GUIDE.md)**
   - State architecture
   - State lifting patterns
   - Context-based state
   - State flow examples
   - Performance optimization

### Reference Documents

8. **[FRONTEND_STRUCTURE.md](./FRONTEND_STRUCTURE.md)**
   - Complete project structure
   - Component hierarchy
   - Data flow overview
   - File organization

9. **[COMPONENT_REFERENCE.md](./COMPONENT_REFERENCE.md)**
   - All component documentation
   - Props and features
   - Hooks and utilities
   - Best practices

## Quick Start


1. Start with [FRONTEND_STRUCTURE.md](./FRONTEND_STRUCTURE.md) for overview
2. Read [STATE_MANAGEMENT_GUIDE.md](./STATE_MANAGEMENT_GUIDE.md) for architecture
3. Review [MIDDLE_SECTION_GUIDE.md](./MIDDLE_SECTION_GUIDE.md) for component patterns
4. Check [COMPONENT_REFERENCE.md](./COMPONENT_REFERENCE.md) for specific components

### For Feature Development
1. [SLOT_MACHINE_GUIDE.md](./SLOT_MACHINE_GUIDE.md) - Game logic
2. [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) - Backend communication
3. [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md) - Config structure

### For UI/UX Work
1. [CONTROL_PANEL_GUIDE.md](./CONTROL_PANEL_GUIDE.md) - User controls
2. [REEL_SYSTEM_GUIDE.md](./REEL_SYSTEM_GUIDE.md) - Visual components
3. [MIDDLE_SECTION_GUIDE.md](./MIDDLE_SECTION_GUIDE.md) - Paytable layout

## Documentation Structure

```
docs/
├── README.md (this file)
├── FRONTEND_STRUCTURE.md (project overview)
├── COMPONENT_REFERENCE.md (all components)
├── MIDDLE_SECTION_GUIDE.md (paytable component)
├── SLOT_MACHINE_GUIDE.md (main game component)
├── CONTROL_PANEL_GUIDE.md (UI controls)
├── REEL_SYSTEM_GUIDE.md (reel components)
├── API_INTEGRATION_GUIDE.md (backend API)
├── CONFIGURATION_GUIDE.md (game config)
└── STATE_MANAGEMENT_GUIDE.md (state patterns)
```

## Key Concepts

### Component Architecture
- **TopSection**: Action games wheel (placeholder)
- **MiddleSection**: Dynamic paytable
- **BottomSection**: Slot machine and controls

### State Management
- **Lifted State**: betAmount in page.tsx
- **Local State**: Component-specific state
- **Context State**: Global config via GameConfigProvider

### Data Flow
- **Props Down**: State passed as props
- **Events Up**: Callbacks for state updates
- **Context**: Global config access

### Configuration
- **JSON Files**: `/public/config/{gameId}.json`
- **Dynamic Loading**: Loaded on app start
- **Bet-Specific**: Payouts vary by bet amount

## Code Comments

All source files are fully commented with:
- Component-level documentation
- Function explanations
- Variable descriptions
- Inline comments for complex logic
- Data flow explanations

## Getting Help

### Common Issues
- Check [Troubleshooting](#) sections in each guide
- Review component comments in source files
- Check [COMPONENT_REFERENCE.md](./COMPONENT_REFERENCE.md)

### Understanding Code
- Read component comments first
- Check related guide documents
- Review data flow diagrams
- Examine example code snippets

## Contributing

When adding new features:
1. Add comments to new code
2. Update relevant guide documents
3. Follow existing patterns
4. Document configuration changes

## Related Documentation

- **Backend API**: See backend documentation
- **Configuration**: See [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md)
- **Deployment**: See project README

