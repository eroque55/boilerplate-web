import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { usersService } from '@/services/api/users';

export const useMe = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.user.me,
    queryFn: usersService.fetchMe,
    enabled,
  });
};
