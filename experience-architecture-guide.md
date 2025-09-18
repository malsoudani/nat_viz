# Experience Architecture Guide

## Overview
This guide outlines the architecture pattern for building "experiences" in our React/TypeScript application. An experience is a bounded context that encapsulates a complete business domain with its own components, state management, and service layer.

## Core Principles

### 1. Bounded Contexts
- Each experience represents a complete business domain
- Experiences are self-contained but can access other experiences' contexts
- Clear separation of concerns between domains

### 2. Functional Programming with FP-TS
- Use `TaskEither` for async operations instead of Promises
- Handle errors functionally rather than throwing exceptions
- Use `pipe` for function composition
- Pattern: `pipe(operation(), TE.match(onError, onSuccess))()`

### 3. Decoupled Service Layer
- Define service interfaces that return `TaskEither<HttpError, T>`
- Implementations can be swapped (API, mock, etc.)
- Business logic is separated from data access

## Client Architecture

The client architecture provides the foundational service layer that experiences build upon. It consists of three key files that work together to provide type-safe, functional API interactions.

### 1. types.ts - Data Type Definitions
**Role**: Central repository for all data types and entities used throughout the application.

**Contents**:
- Entity interfaces (User, Team, etc.)
- Enum definitions with their mappings
- Response data structures
- Type definitions for complex objects

**Example**:
```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export enum TeamType {
  DEPARTMENT = "DEPARTMENT",
  TEAM = "TEAM",
  // ...
}

export const TeamTypeArabicMapping: Record<TeamType, string> = {
  [TeamType.DEPARTMENT]: "قسم",
  [TeamType.TEAM]: "فريق",
  // ...
};
```

### 2. interfaces.ts - Service Contracts & Data Interfaces
**Role**: Defines the contracts for API services and data structures for request/response payloads.

**Contents**:
- Client interfaces (IExperienceClient) that specify service method signatures
- Data interfaces for API request/response objects
- Uses TaskEither for functional error handling

**Example**:
```typescript
export interface IExperienceClient {
  getList(params?: ListParams): TaskEither<HttpError, ListData>;
  create(data: CreateData): TaskEither<HttpError, CreatedData>;
  // ...
}

export interface CreateData {
  name: string;
  type: ExperienceType;
  // ...
}
```

### 3. config.ts - Client Configuration & Instantiation
**Role**: Central configuration hub that sets up and provides all service clients to the application.

**Contents**:
- API URL configuration from environment variables
- HttpClient instantiation
- Client class instantiation and export through `clients` object

**Example**:
```typescript
export const API_URL = import.meta.env.VITE_API_URL;

const httpClient = new HttpClient(API_URL);

export const clients = {
  experience: new ExperienceClient(httpClient),
  auth: new AuthenticationClient(httpClient),
  // ...
};
```

### Client Architecture Flow
1. **types.ts** defines the data models
2. **interfaces.ts** defines how services interact with those data models
3. **config.ts** creates concrete implementations and makes them available
4. Experiences import clients from config and use them in their state managers

**Usage in Experiences**: State managers receive client instances through props and use them to perform business logic operations.

## Architecture Components

### State Management Pattern

#### 1. State Classes
```typescript
// Base state class
export class ExperienceState {}

// Concrete states extend base
export class LoadingState extends ExperienceState {}
export class LoadedState extends ExperienceState {
  constructor(public data: DataType) {
    super();
  }
}
export class ErrorState extends ExperienceState {
  constructor(public message: string) {
    super();
  }
}
```

#### 2. Event Classes
```typescript
// Base event class
export class ExperienceEvent {}

// Concrete events extend base and carry data
export class FormSubmitted extends ExperienceEvent {
  constructor(public formData: FormData) {
    super();
  }
}

export class DataRequested extends ExperienceEvent {
  constructor(public id: string) {
    super();
  }
}
```

#### 3. State Manager Hook
```typescript
interface IExperienceStateProps {
  experienceSvc: IExperienceClient;
}

export const useExperienceState = ({ experienceSvc }: IExperienceStateProps) => {
  // State hooks for different state types
  const [listState, setListState] = useState<ListState>(new ListLoading());
  const [detailState, setDetailState] = useState<DetailState>(new DetailIdle());

  // Event emitter - maps events to handlers
  const emitEvent = (event: ExperienceEvent) => {
    switch (event.constructor) {
      case FormSubmitted: {
        const e = event as FormSubmitted;
        handleFormSubmission(e.formData);
        break;
      }
      case DataRequested: {
        const e = event as DataRequested;
        handleDataRequest(e.id);
        break;
      }
      default:
        console.warn("Unhandled event:", event);
    }
  };

  // Business logic handlers
  const handleFormSubmission = async (formData: FormData) => {
    setFormState(new FormSubmitting());

    await pipe(
      experienceSvc.submitForm(formData),
      TE.match(
        (error: HttpError) => {
          setFormState(new FormError(error.message));
        },
        (result) => {
          setFormState(new FormSuccess(result));
        }
      )
    )();
  };

  return {
    emitEvent,
    listState,
    detailState,
    formState,
  };
};
```

#### 4. Context Provider
```typescript
export interface ExperienceContextProps {
  emitEvent?: (event: ExperienceEvent) => void;
  listState?: ListState;
  detailState?: DetailState;
  formState?: FormState;
}

const ExperienceContext = createContext<ExperienceContextProps>({});

export const ExperienceProvider = ({ children }: { children: React.ReactNode }) => {
  const stateManager = useExperienceState({
    experienceSvc: clients.experience,
  });

  return (
    <ExperienceContext.Provider value={stateManager}>
      {children}
    </ExperienceContext.Provider>
  );
};

export const useExperienceContext = () => useContext(ExperienceContext);
```

### Service Layer Pattern

#### 1. Service Interface
```typescript
export interface IExperienceClient {
  getList(params?: ListParams): TaskEither<HttpError, ListData>;
  getDetail(id: string): TaskEither<HttpError, DetailData>;
  create(data: CreateData): TaskEither<HttpError, CreatedData>;
  update(id: string, data: UpdateData): TaskEither<HttpError, UpdatedData>;
  delete(id: string): TaskEither<HttpError, void>;
}
```

#### 2. Service Implementation
```typescript
export class ExperienceClient implements IExperienceClient {
  constructor(private httpClient: HttpClient) {}

  getList(params?: ListParams): TaskEither<HttpError, ListData> {
    return this.httpClient.get<ListData>('/api/experience', { params });
  }

  getDetail(id: string): TaskEither<HttpError, DetailData> {
    return this.httpClient.get<DetailData>(`/api/experience/${id}`);
  }

  create(data: CreateData): TaskEither<HttpError, CreatedData> {
    return this.httpClient.post<CreatedData>('/api/experience', data);
  }

  update(id: string, data: UpdateData): TaskEither<HttpError, UpdatedData> {
    return this.httpClient.put<UpdatedData>(`/api/experience/${id}`, data);
  }

  delete(id: string): TaskEither<HttpError, void> {
    return this.httpClient.delete(`/api/experience/${id}`);
  }
}
```

### Component Integration

#### 1. Container Components
```typescript
export const ExperienceContainer = () => {
  const { emitEvent, listState, detailState } = useExperienceContext();

  useEffect(() => {
    // Emit initial data request
    emitEvent(new DataRequested('initial'));
  }, [emitEvent]);

  return (
    <div>
      {listState instanceof LoadingState && <LoadingSpinner />}
      {listState instanceof LoadedState && (
        <ExperienceList data={listState.data} />
      )}
      {listState instanceof ErrorState && (
        <ErrorMessage message={listState.message} />
      )}
    </div>
  );
};
```

#### 2. UI Components
```typescript
export const ExperienceForm = () => {
  const { emitEvent, formState } = useExperienceContext();

  const handleSubmit = (formData: FormData) => {
    emitEvent(new FormSubmitted(formData));
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button
        type="submit"
        disabled={formState instanceof FormSubmitting}
      >
        {formState instanceof FormSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};
```

## Implementation Steps

### Step 1: Define the Domain
1. Identify the business domain and its boundaries
2. Define the data types and interfaces
3. Determine the user interactions and workflows

### Step 2: Create Service Layer
1. Define `IExperienceClient` interface with all required methods
2. Implement the client class using `HttpClient`
3. Add the client to the `clients` configuration

### Step 3: Build State Management
1. Create state classes for all possible states
2. Create event classes for all user actions
3. Implement the state manager hook with event emitter
4. Create context provider and hook

### Step 4: Implement Components
1. Create container components that use the context
2. Build UI components that emit events
3. Handle state changes in component rendering

### Step 5: Add Business Logic
1. Implement event handlers in the state manager
2. Add validation and error handling
3. Implement success/error state transitions

## File Structure Template

```
src/
  clients/
    config.ts (client configuration and instantiation)
    interfaces.ts (service contracts and data interfaces)
    types.ts (data type definitions)
    httpClient.ts (HTTP client implementation)
    experience.ts (implement ExperienceClient)
  experiences/
    experience-name/
      components/
        ExperienceContainer.tsx
        ExperienceForm.tsx
        ExperienceList.tsx
      state/
        ExperienceState.tsx
        ExperienceEvent.tsx
        ExperienceManager.tsx
        ExperienceContext.tsx
      mock/
        mockData.ts
```


## Key Patterns to Remember

1. **Always start with state management** - define states and events first
2. **Use functional error handling** - return errors as data, don't throw
3. **Keep service implementations decoupled** - interface vs implementation
4. **Emit events from components** - don't call service methods directly
5. **Handle state in components** - use instanceof checks for state types
6. **Use FP-TS consistently** - pipe, TaskEither, match patterns

## Common Mistakes to Avoid

1. Don't throw errors - use TaskEither
2. Don't call services directly from components - emit events
3. Don't mix state logic with UI logic
4. Don't forget to handle all event types in the emitter
5. Don't access other experiences' services directly - use their contexts

## Example: Complete Experience Implementation

See the workflow experience in `/src/experiences/workflow/` for a complete working example following all these patterns.</content>
<parameter name="filePath">/Users/mohamedalsoudani/code/personal/nat_viz/experience-architecture-guide.md