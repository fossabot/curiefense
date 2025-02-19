import VersionControl from '@/views/VersionControl'
import {describe, test, expect, beforeEach, afterEach, jest} from '@jest/globals'
import {mount} from '@vue/test-utils'
import GitHistory from '@/components/GitHistory'
import Vue from 'vue'

jest.mock('axios')
import axios from 'axios'

describe('VersionControl.vue', () => {
    let wrapper
    let gitData
    beforeEach(() => {
        gitData = [
            {
                'id': 'master',
                'description': 'Update entry [__default__] of document [aclprofiles]',
                'date': '2020-11-10T15:49:17+02:00',
                'logs': [
                    {
                        'version': '7dd9580c00bef1049ee9a531afb13db9ef3ee956',
                        'date': '2020-11-10T15:49:17+02:00',
                        'parents': [
                            'fc47a6cd9d7f254dd97875a04b87165cc484e075'
                        ],
                        'message': 'Update entry [__default__] of document [aclprofiles]',
                        'email': 'curiefense@reblaze.com',
                        'author': 'Curiefense API'
                    },
                    {
                        'version': 'fc47a6cd9d7f254dd97875a04b87165cc484e075',
                        'date': '2020-11-10T15:48:35+02:00',
                        'parents': [
                            '5aba4a5b9d6faea1896ee8965c7aa651f76af63c'
                        ],
                        'message': 'Update entry [__default__] of document [aclprofiles]',
                        'email': 'curiefense@reblaze.com',
                        'author': 'Curiefense API'
                    },
                    {
                        'version': '5aba4a5b9d6faea1896ee8965c7aa651f76af63c',
                        'date': '2020-11-10T15:48:31+02:00',
                        'parents': [
                            '277c5d7bd0e2eb4b9d2944f7eefdfadf37ba8581'
                        ],
                        'message': 'Update entry [__default__] of document [aclprofiles]',
                        'email': 'curiefense@reblaze.com',
                        'author': 'Curiefense API'
                    },
                    {
                        'version': '277c5d7bd0e2eb4b9d2944f7eefdfadf37ba8581',
                        'date': '2020-11-10T15:48:22+02:00',
                        'parents': [
                            '878b47deeddac94625fe7c759786f2df885ec541'
                        ],
                        'message': 'Update entry [__default__] of document [aclprofiles]',
                        'email': 'curiefense@reblaze.com',
                        'author': 'Curiefense API'
                    },
                    {
                        'version': '878b47deeddac94625fe7c759786f2df885ec541',
                        'date': '2020-11-10T15:48:05+02:00',
                        'parents': [
                            '93c180513fe7edeaf1c0ca69a67aa2a11374da4f'
                        ],
                        'message': 'Update entry [__default__] of document [aclprofiles]',
                        'email': 'curiefense@reblaze.com',
                        'author': 'Curiefense API'
                    },
                    {
                        'version': '93c180513fe7edeaf1c0ca69a67aa2a11374da4f',
                        'date': '2020-11-10T15:47:59+02:00',
                        'parents': [
                            '1662043d2a18d6ad2c9c94d6f826593ff5506354'
                        ],
                        'message': 'Update entry [__default__] of document [aclprofiles]',
                        'email': 'curiefense@reblaze.com',
                        'author': 'Curiefense API'
                    },
                    {
                        'version': '1662043d2a18d6ad2c9c94d6f826593ff5506354',
                        'date': '2020-11-08T21:31:41+01:00',
                        'parents': [
                            '16379cdf39501574b4a2f5a227b82a4454884b84'
                        ],
                        'message': 'Create config [master]\n',
                        'email': 'curiefense@reblaze.com',
                        'author': 'Curiefense API'
                    },
                    {
                        'version': '16379cdf39501574b4a2f5a227b82a4454884b84',
                        'date': '2020-08-27T16:19:06+00:00',
                        'parents': [
                            'a34f979217215060861b58b3f270e82580c20efb'
                        ],
                        'message': 'Initial empty config',
                        'email': 'curiefense@reblaze.com',
                        'author': 'Curiefense API'
                    },
                    {
                        'version': 'a34f979217215060861b58b3f270e82580c20efb',
                        'date': '2020-08-27T16:19:06+00:00',
                        'parents': [],
                        'message': 'Initial empty content',
                        'email': 'curiefense@reblaze.com',
                        'author': 'Curiefense API'
                    }
                ],
                'version': '7dd9580c00bef1049ee9a531afb13db9ef3ee956'
            },
            {
                'id': 'zzz_branch',
                'description': 'Initial empty content',
                'date': '2020-08-27T16:19:06+00:00',
                'logs': [
                    {
                        'version': 'a34f979217215060861b58b3f270e82580c20efb',
                        'date': '2020-08-27T16:19:06+00:00',
                        'parents': [],
                        'message': 'Initial empty content',
                        'email': 'curiefense@reblaze.com',
                        'author': 'Curiefense API'
                    }
                ],
                'version': 'a34f979217215060861b58b3f270e82580c20efb'
            }
        ]
        axios.get.mockImplementation((path) => {
            if (path === '/conf/api/v1/configs/') {
                return Promise.resolve({data: gitData})
            }
            if (path === '/conf/api/v1/configs/master/') {
                return Promise.resolve({data: gitData[0]})
            }
            if (path === '/conf/api/v1/configs/zzz_branch/') {
                return Promise.resolve({data: gitData[1]})
            }
            if (path === '/conf/api/v1/configs/master/v/') {
                return Promise.resolve({data: gitData[0].logs})
            }
            if (path === '/conf/api/v1/configs/zzz_branch/v/') {
                return Promise.resolve({data: gitData[1].logs})
            }
            Promise.resolve({data: {}})
        })
        wrapper = mount(VersionControl)
    })

    test('should have a git history component', () => {
        const gitHistory = wrapper.findComponent(GitHistory)
        expect(gitHistory).toBeTruthy()
    })

    test('should display correct amount of branches', () => {
        const gitBranches = wrapper.find('.git-branches')
        expect(gitBranches.text()).toContain('2 branches')
    })

    test('should display correct amount of commits', () => {
        const gitCommits = wrapper.find('.git-commits')
        expect(gitCommits.text()).toContain('10 commits')
    })

    test('should be able to switch branches through dropdown', (done) => {
        const branchSelection = wrapper.find('.branch-selection')
        branchSelection.trigger('click')
        const options = branchSelection.findAll('option')
        options.at(1).element.selected = true
        branchSelection.trigger('change')
        // allow all requests to finish
        setImmediate(() => {
            expect(branchSelection.element.selectedIndex).toEqual(1)
            done()
        })
    })

    test('should have correct git log displayed after switching branches', async (done) => {
        const branchSelection = wrapper.find('.branch-selection')
        branchSelection.trigger('click')
        const options = branchSelection.findAll('option')
        options.at(1).element.selected = true
        branchSelection.trigger('change')
        // allow all requests to finish
        setImmediate(() => {
            const gitHistory = wrapper.findComponent(GitHistory)
            expect(gitHistory.props('gitLog')).toEqual(gitData[1].logs)
            done()
        })
    })

    test('should have fork branch input be hidden on init', async () => {
        const forkBranchNameInput = wrapper.find('.fork-branch-input')
        expect(forkBranchNameInput.element).toBeUndefined()
    })

    test('should have delete branch input be hidden on init', async () => {
        const deleteBranchNameInput = wrapper.find('.delete-branch-input')
        expect(deleteBranchNameInput.element).toBeUndefined()
    })

    test('should send API request to restore to the correct version', async () => {
        const wantedVersion = {
            version: '7dd9580c00bef1049ee9a531afb13db9ef3ee956'
        }
        let putSpy
        axios.put.mockImplementation(() => Promise.resolve())
        putSpy = jest.spyOn(axios, 'put')
        const gitHistory = wrapper.findComponent(GitHistory)
        gitHistory.vm.$emit('restoreVersion', wantedVersion)
        await Vue.nextTick()
        expect(putSpy).toHaveBeenCalledWith(`/conf/api/v1/configs/master/v/${wantedVersion.version}/revert/`)
    })

    describe('fork branch', () => {
        let postSpy
        beforeEach(async () => {
            axios.post.mockImplementation(() => Promise.resolve())
            postSpy = jest.spyOn(axios, 'post')
            const forkBranchIcon = wrapper.find('.fork-branch-toggle')
            forkBranchIcon.trigger('click')
            await Vue.nextTick()
        })
        afterEach(() => {
            jest.clearAllMocks()
        })

        test('should be visible if toggled on', async () => {
            const forkBranchNameInput = wrapper.find('.fork-branch-input')
            expect(forkBranchNameInput.element).toBeDefined()
        })

        test('should be hidden if toggled off', async () => {
            const forkBranchIcon = wrapper.find('.fork-branch-toggle')
            forkBranchIcon.trigger('click')
            await Vue.nextTick()
            const forkBranchNameInput = wrapper.find('.fork-branch-input')
            expect(forkBranchNameInput.element).toBeUndefined()
        })

        test('should be able to fork if name does not exist and does not have spaces', async () => {
            const newBranchName = 'new_branch'
            const forkBranchNameInput = wrapper.find('.fork-branch-input')
            const forkBranchSaveButton = wrapper.find('.fork-branch-confirm')
            forkBranchNameInput.element.value = newBranchName
            forkBranchNameInput.trigger('input')
            await Vue.nextTick()
            forkBranchSaveButton.trigger('click')
            await Vue.nextTick()
            expect(postSpy).toHaveBeenCalledWith(`/conf/api/v1/configs/master/clone/${newBranchName}/`, {
                'description': 'string',
                'id': 'string'
            })
        })

        test('should not be able to fork if name is empty', async () => {
            const forkBranchNameInput = wrapper.find('.fork-branch-input')
            const forkBranchSaveButton = wrapper.find('.fork-branch-confirm')
            forkBranchNameInput.element.value = ''
            forkBranchNameInput.trigger('input')
            await Vue.nextTick()
            forkBranchSaveButton.trigger('click')
            await Vue.nextTick()
            expect(postSpy).not.toHaveBeenCalled()
        })

        test('should not be able to fork if name already exists', async () => {
            const forkBranchNameInput = wrapper.find('.fork-branch-input')
            const forkBranchSaveButton = wrapper.find('.fork-branch-confirm')
            forkBranchNameInput.element.value = 'zzz_branch'
            forkBranchNameInput.trigger('input')
            await Vue.nextTick()
            forkBranchSaveButton.trigger('click')
            await Vue.nextTick()
            expect(postSpy).not.toHaveBeenCalled()
        })

        test('should not be able to fork if name contains spaces', async () => {
            const forkBranchNameInput = wrapper.find('.fork-branch-input')
            const forkBranchSaveButton = wrapper.find('.fork-branch-confirm')
            forkBranchNameInput.element.value = 'a new branch name'
            forkBranchNameInput.trigger('input')
            await Vue.nextTick()
            forkBranchSaveButton.trigger('click')
            await Vue.nextTick()
            expect(postSpy).not.toHaveBeenCalled()
        })

        test('should be hidden if forked successfully', async () => {
            const newBranchName = 'new_branch'
            let forkBranchNameInput = wrapper.find('.fork-branch-input')
            const forkBranchSaveButton = wrapper.find('.fork-branch-confirm')
            forkBranchNameInput.element.value = newBranchName
            forkBranchNameInput.trigger('input')
            await Vue.nextTick()
            forkBranchSaveButton.trigger('click')
            // process click
            await Vue.nextTick()
            // process API (fake) return
            await Vue.nextTick()
            forkBranchNameInput = wrapper.find('.fork-branch-input')
            expect(forkBranchNameInput.element).toBeUndefined()
        })

        test('should be visible if fork failed', async () => {
            axios.post.mockImplementation(() => Promise.reject())
            const newBranchName = 'new_branch'
            let forkBranchNameInput = wrapper.find('.fork-branch-input')
            const forkBranchSaveButton = wrapper.find('.fork-branch-confirm')
            forkBranchNameInput.element.value = newBranchName
            forkBranchNameInput.trigger('input')
            await Vue.nextTick()
            forkBranchSaveButton.trigger('click')
            await Vue.nextTick()
            forkBranchNameInput = wrapper.find('.fork-branch-input')
            expect(forkBranchNameInput.element).toBeDefined()
        })
    })

    describe('delete branch', () => {
        let deleteSpy
        beforeEach(async () => {
            axios.delete.mockImplementation(() => Promise.resolve())
            deleteSpy = jest.spyOn(axios, 'delete')
            const deleteBranchIcon = wrapper.find('.delete-branch-toggle')
            deleteBranchIcon.trigger('click')
            await Vue.nextTick()
        })
        afterEach(() => {
            jest.clearAllMocks()
        })

        test('should be visible if toggled on', async () => {
            const deleteBranchNameInput = wrapper.find('.delete-branch-input')
            expect(deleteBranchNameInput.element).toBeDefined()
        })

        test('should be hidden if toggled off', async () => {
            const deleteBranchIcon = wrapper.find('.delete-branch-toggle')
            deleteBranchIcon.trigger('click')
            await Vue.nextTick()
            const deleteBranchNameInput = wrapper.find('.delete-branch-input')
            expect(deleteBranchNameInput.element).toBeUndefined()
        })

        test('should be able to delete if name matches current branch name', async () => {
            const currentBranchName = wrapper.vm.selectedBranch
            const deleteBranchNameInput = wrapper.find('.delete-branch-input')
            const deleteBranchSaveButton = wrapper.find('.delete-branch-confirm')
            deleteBranchNameInput.element.value = currentBranchName
            deleteBranchNameInput.trigger('input')
            await Vue.nextTick()
            deleteBranchSaveButton.trigger('click')
            await Vue.nextTick()
            expect(deleteSpy).toHaveBeenCalledWith(`/conf/api/v1/configs/${currentBranchName}/`)
        })

        test('should not be able to delete if name is empty', async () => {
            const deleteBranchNameInput = wrapper.find('.delete-branch-input')
            const deleteBranchSaveButton = wrapper.find('.delete-branch-confirm')
            deleteBranchNameInput.element.value = ''
            deleteBranchNameInput.trigger('input')
            await Vue.nextTick()
            deleteBranchSaveButton.trigger('click')
            await Vue.nextTick()
            expect(deleteSpy).not.toHaveBeenCalled()
        })

        test('should not be able to delete if name does not match current branch name', async () => {
            const deleteBranchNameInput = wrapper.find('.delete-branch-input')
            const deleteBranchSaveButton = wrapper.find('.delete-branch-confirm')
            deleteBranchNameInput.element.value = 'new_branch'
            deleteBranchNameInput.trigger('input')
            await Vue.nextTick()
            deleteBranchSaveButton.trigger('click')
            await Vue.nextTick()
            expect(deleteSpy).not.toHaveBeenCalled()
        })

        test('should be hidden if deleted successfully', async () => {
            const currentBranchName = wrapper.vm.selectedBranch
            let deleteBranchNameInput = wrapper.find('.delete-branch-input')
            const deleteBranchSaveButton = wrapper.find('.delete-branch-confirm')
            deleteBranchNameInput.element.value = currentBranchName
            deleteBranchNameInput.trigger('input')
            await Vue.nextTick()
            deleteBranchSaveButton.trigger('click')
            // process click
            await Vue.nextTick()
            // process API (fake) return
            await Vue.nextTick()
            deleteBranchNameInput = wrapper.find('.delete-branch-input')
            expect(deleteBranchNameInput.element).toBeUndefined()
        })

        test('should be visible if delete failed', async () => {
            axios.delete.mockImplementation(() => Promise.reject())
            const newBranchName = 'new_branch'
            let deleteBranchNameInput = wrapper.find('.delete-branch-input')
            const deleteBranchSaveButton = wrapper.find('.delete-branch-confirm')
            deleteBranchNameInput.element.value = newBranchName
            deleteBranchNameInput.trigger('input')
            await Vue.nextTick()
            deleteBranchSaveButton.trigger('click')
            await Vue.nextTick()
            deleteBranchNameInput = wrapper.find('.delete-branch-input')
            expect(deleteBranchNameInput.element).toBeDefined()
        })
    })
})
