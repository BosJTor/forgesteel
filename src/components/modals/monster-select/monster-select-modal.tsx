import { Alert, Button, Input, Space } from 'antd';
import { Modal } from '../modal/modal';
import { Monster } from '../../../models/monster';
import { MonsterOrganizationType } from '../../../enums/monster-organization-type';
import { MonsterPanel } from '../../panels/elements/monster-panel/monster-panel';
import { MonsterRoleType } from '../../../enums/monster-role-type';
import { SearchOutlined } from '@ant-design/icons';
import { SelectablePanel } from '../../controls/selectable-panel/selectable-panel';
import { Sourcebook } from '../../../models/sourcebook';
import { SourcebookLogic } from '../../../logic/sourcebook-logic';
import { Utils } from '../../../utils/utils';
import { useState } from 'react';

import './monster-select-modal.scss';

interface Props {
	type: 'companion' | 'mount' | 'retainer';
	sourcebooks: Sourcebook[];
	onClose: () => void;
	onSelect: (monster: Monster) => void;
}

export const MonsterSelectModal = (props: Props) => {
	const [ searchTerm, setSearchTerm ] = useState<string>('');

	try {
		const monsters = SourcebookLogic
			.getMonsterGroups(props.sourcebooks)
			.flatMap(g => g.monsters)
			.filter(m => {
				switch (props.type) {
					case 'mount':
						return m.role.type === MonsterRoleType.Mount;
					case 'retainer':
						return m.role.organization === MonsterOrganizationType.Retainer;
				}

				return true;
			})
			.filter(m => Utils.textMatches([
				m.name,
				m.description,
				...m.keywords
			], searchTerm));

		return (
			<Modal
				toolbar={
					<>
						<Input
							placeholder='Search'
							allowClear={true}
							value={searchTerm}
							suffix={<SearchOutlined />}
							onChange={e => setSearchTerm(e.target.value)}
						/>
						<Button onClick={props.onClose}>Cancel</Button>
					</>
				}
				content={
					<div className='monster-select-modal'>
						<Space direction='vertical' style={{ width: '100%' }}>
							{
								monsters.map(m => (
									<SelectablePanel
										key={m.id}
										onSelect={() => {
											const copy = JSON.parse(JSON.stringify(m)) as Monster;
											copy.id = Utils.guid();
											props.onSelect(copy);
										}}
									>
										<MonsterPanel monster={m} />
									</SelectablePanel>
								))
							}
							{
								monsters.length === 0 ?
									<Alert
										type='warning'
										showIcon={true}
										message='No monsters to show'
									/>
									: null
							}
						</Space>
					</div>
				}
				onClose={props.onClose}
			/>
		);
	} catch (ex) {
		console.error(ex);
		return null;
	}
};
