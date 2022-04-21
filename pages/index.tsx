import type { NextPage } from 'next'

const Home: NextPage = () => {
  return (
    <div className='w-full h-full flex flex-col justify-center items-center'>
      <div className='lg:w-1/2 h-3/4 flex flex-wrap bg-slate-300 opacity-70'>
        <div className='w-full'>logo</div>
        <div className='w-full'>form</div>
        <div className='w-full'>other options</div>
      </div>
    </div>
  )
}

export default Home
