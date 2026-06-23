import { NavArrowUp, NavArrowDown } from 'iconoir-react'

export default function SortHead({ label, sortKey, sort, onSort, num }) {
  const active = sort.key === sortKey
  return (
    <button className={`tt-sort${num ? ' num' : ''}${active ? ' active' : ''}`} onClick={() => onSort(sortKey)}>
      {label}
      {active
        ? (sort.dir === 'asc'
            ? <NavArrowUp width={13} height={13} />
            : <NavArrowDown width={13} height={13} />)
        : <NavArrowDown width={13} height={13} className="tt-sort-dim" />}
    </button>
  )
}
