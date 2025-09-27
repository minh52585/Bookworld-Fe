import { Breadcrumb, BreadcrumbProps } from 'antd'
import { matchPath, useLocation } from 'react-router'
import { breadcrumbNameMap } from '../consts/breadscrum';

const AppBreadcrumb = () => {
  const location = useLocation();
  const { pathname } = location;
  const matched = Object.entries(breadcrumbNameMap).find(([key]) =>
    matchPath(key, pathname)
  )?.[1];

  const breadcrumbItems: BreadcrumbProps['items'] = matched
    ? [
        { title: matched.group },
        { title: matched.label },
        ...(matched.action ? [{ title: matched.action }] : [])
      ]
    : [{ title: 'Trang không xác định' }];

  return (
    <Breadcrumb style={{ margin: '16px 0' }} items={breadcrumbItems} />
  );
};

export default AppBreadcrumb;