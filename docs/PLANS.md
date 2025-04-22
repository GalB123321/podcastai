# PodcastAI Plan Access System

This document outlines the plan tiers and feature access control system in PodcastAI.

## Plan Tiers

### Personal Plan
- Basic podcast creation
- 100 monthly credits
- 30-minute max episode length
- 1GB storage limit
- Single user

### Creator Plan
- Everything in Personal, plus:
- Spotify export
- Advanced dashboard
- Template library
- 500 monthly credits
- 60-minute max episode length
- 5GB storage limit
- Up to 3 team members

### Business Plan
- Everything in Creator, plus:
- Promotional content insertion
- Custom branding
- API access
- Priority support
- 2000 monthly credits
- 120-minute max episode length
- 20GB storage limit
- Up to 10 team members

### Enterprise Plan
- Everything in Business, plus:
- Custom solutions
- Dedicated support
- 5000 monthly credits
- 240-minute max episode length
- 100GB storage limit
- Up to 25 team members

## Feature Access Matrix

| Feature | Personal | Creator | Business | Enterprise |
|---------|----------|----------|-----------|------------|
| Promotion | ❌ | ❌ | ✅ | ✅ |
| Spotify Export | ❌ | ✅ | ✅ | ✅ |
| Advanced Dashboard | ❌ | ✅ | ✅ | ✅ |
| Templates | ❌ | ✅ | ✅ | ✅ |
| Custom Branding | ❌ | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ❌ | ✅ | ✅ |
| Team Management | ❌ | ✅ | ✅ | ✅ |

## Implementation Details

### Access Control
The access control system is implemented in `src/lib/planAccess.ts`. It provides:
- Type-safe plan and feature definitions using Zod
- Feature access checking via `hasAccessToFeature`
- Plan comparison via `meetsMinimumPlan`
- Feature availability queries via `getAvailableFeatures`

### Usage in Components
```typescript
import { hasAccessToFeature, type Feature } from '@/lib/planAccess';

// Check feature access
if (!hasAccessToFeature(user.plan, 'spotifyExport')) {
  return <PlanLockMessage feature="Spotify export" planRequired="creator" />;
}

// Disable features based on plan
<Button 
  disabled={!hasAccessToFeature(user.plan, 'customBranding')}
  title={!hasAccessToFeature(user.plan, 'customBranding') ? 'Available on Business plan' : ''}
>
  Customize Brand
</Button>
```

### Plan Lock Message
A reusable component for displaying feature restrictions:
```typescript
import { PlanLockMessage } from '@/components/access/PlanLockMessage';

<PlanLockMessage 
  feature="custom branding" 
  planRequired="business" 
/>
```

## Testing Plan Changes

1. Update user's plan in Firebase Console:
   ```
   Collection: users
   Document: [userId]
   Field: plan
   Value: "personal" | "creator" | "business" | "enterprise"
   ```

2. Verify feature access:
   - Log in as the user
   - Check feature visibility
   - Confirm lock messages
   - Test feature interactions

## Future Improvements

- [ ] Add usage tracking per plan
- [ ] Implement automatic plan downgrades
- [ ] Add granular feature controls
- [ ] Create plan comparison page 