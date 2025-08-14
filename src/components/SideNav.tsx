import { ComponentType, FC, SVGProps } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    HomeIcon
} from '@heroicons/react/24/outline';
import { classNames } from '../lib/utils/classNames';
import { useProfileImages } from '@/hooks/useProfileImages';
import { useUser } from '../context/UserContext';
import { mapPostgresUserToResponseUser } from '@/mappers/userMappers';

interface NavItem { name: string; href: string; icon: ComponentType<SVGProps<SVGSVGElement>>; }

const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon }
];

const SideNav: FC = () => {
    const { authUser, profile } = useUser();
    const { renderImage } = useProfileImages(mapPostgresUserToResponseUser(profile!));
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <div className="flex h-full flex-col justify-between overflow-y-auto bg-gray-900 px-6 pb-2 hide-scrollbar">
            <div>
                {/* Logo */}
                <div className="flex h-16 items-center">
                    <img
                        src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                        alt="Logo"
                        className="h-8 w-auto"
                    />
                </div>

                {/* Main navigation */}
                <nav className="mt-6">
                    <ul role="list" className="space-y-1">
                        {navigation.map(item => {
                            const current = location.pathname === item.href;
                            return (
                                <li key={item.name}>
                                    <button
                                        onClick={() => navigate(item.href)}
                                        className={classNames(
                                            current ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                                            'flex w-full items-center gap-x-3 rounded-md px-2 py-2 text-sm font-semibold cursor-pointer'
                                        )}
                                    >
                                        <item.icon className="h-6 w-6" aria-hidden="true" />
                                        <span className="flex-1 text-left">{item.name}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>

            {/* User profile footer */}
            {profile && (
                <button
                    onClick={() => { navigate('/settings') }}
                    className="flex w-full items-center gap-x-4 px-2 py-3 text-sm font-semibold text-white hover:bg-gray-800 rounded-md cursor-pointer"
                >
                    {renderImage(
                        profile.avatar_photo,
                        'avatarPhoto',
                        'h-10 w-10 text-sm rounded-full ring-2 ring-white'
                    )}
                    <span className="flex-1 text-left truncate">
                        {profile.display_name || authUser?.email}
                    </span>
                </button>
            )}
        </div>
    );
};

export default SideNav;
