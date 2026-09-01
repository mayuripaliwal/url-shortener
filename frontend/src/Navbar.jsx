import { Disclosure, DisclosureButton, DisclosurePanel} from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import {Link,NavLink} from "react-router-dom";

export default function Navbar({currPage}){
const navigation = [
  { name: 'Home', linkTo: '/', current: currPage==='Home'?true:false },
  { name: 'Analytics', linkTo: '/analytics',current: currPage==='Analytics'?true:false}
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

  return (
    <Disclosure as="nav" className="relative bg-indigo-600">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <Link 
              to='/home'
              className="text-2xl text-white-900"
              >
                trimly
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:block">

              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.linkTo}
                    aria-current={item.current ? 'page' : undefined}
                    className={classNames(
                      item.current ? 'bg-gray-100 text-black' : 'text-gray-100 hover:bg-gray/5 hover:text-white',
                      'rounded-md px-3 py-2 text-sm font-medium',
                    )}
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
              
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            
            <NavLink 
            to ="/logout"
            className="text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-white/10 aria-[current=page]:bg-gray-100 aria-[current=page]:text-black">
            Logout
            </NavLink>
            
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              className={classNames(
                item.current ? 'bg-gray-100 text-black' : 'text-gray-100 hover:bg-gray/5 hover:text-white',
                'rounded-md px-3 py-2 text-sm font-medium',
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  )
}
