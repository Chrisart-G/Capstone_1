import React from 'react';
import { Bell, Shield } from 'lucide-react';

function Usersettings({ notifications, setNotifications, privacy, setPrivacy }) {
  return React.createElement(
    'div',
    { className: 'space-y-6' },
    // Notifications Card
    React.createElement(
      'div',
      { className: 'bg-white rounded-lg p-6 shadow-sm border' },
      React.createElement(
        'h3',
        { className: 'text-lg font-semibold mb-4 flex items-center gap-2' },
        React.createElement(Bell, { size: 20, className: 'text-blue-600' }),
        'Notification Preferences'
      ),
      React.createElement(
        'div',
        { className: 'space-y-4' },
        React.createElement(
          'label',
          { className: 'flex items-center justify-between' },
          React.createElement(
            'div',
            null,
            React.createElement('span', { className: 'text-gray-700 font-medium' }, 'Application Status Updates'),
            React.createElement(
              'p',
              { className: 'text-sm text-gray-500' },
              'Receive notifications when your application status changes'
            )
          ),
          React.createElement('input', {
            type: 'checkbox',
            checked: notifications,
            onChange: (e) => setNotifications(e.target.checked),
            className: 'w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500',
          })
        )
      )
    ),

    // Privacy Card
    React.createElement(
      'div',
      { className: 'bg-white rounded-lg p-6 shadow-sm border' },
      React.createElement(
        'h3',
        { className: 'text-lg font-semibold mb-4 flex items-center gap-2' },
        React.createElement(Shield, { size: 20, className: 'text-blue-600' }),
        'Privacy Settings'
      ),
      React.createElement(
        'div',
        { className: 'space-y-4' },
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Profile Visibility'),
        React.createElement(
          'select',
          {
            value: privacy,
            onChange: (e) => setPrivacy(e.target.value),
            className: 'w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
          },
          React.createElement('option', { value: 'public' }, 'Public'),
          React.createElement('option', { value: 'private' }, 'Private'),
          React.createElement('option', { value: 'onlyme' }, 'Only Me')
        )
      )
    )
  );
}

export default Usersettings;
